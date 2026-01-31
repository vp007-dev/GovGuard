import json
import os
import hashlib
from typing import List, Dict, Tuple, Optional
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import imagehash

from .services.mock_cloud import mock_s3

CLAIMS_FILE = "claims_store.json"

class ClaimsManager:
    def __init__(self):
        self.claims = self.load_claims()

    def load_claims(self) -> List[Dict]:
        if os.path.exists(CLAIMS_FILE):
            try:
                with open(CLAIMS_FILE, 'r') as f:
                    return json.load(f)
            except:
                return []
        return []

    def save_claims(self):
        with open(CLAIMS_FILE, 'w') as f:
            json.dump(self.claims, f, indent=4)

    def _get_exif_data(self, image: Image.Image) -> Dict:
        """Extracts EXIF data from an image."""
        exif_data = {}
        if not image.getexif():
            return exif_data

        for tag_id, value in image.getexif().items():
            tag = TAGS.get(tag_id, tag_id)
            if tag == "GPSInfo":
                gps_data = {}
                for t in value:
                    sub_tag = GPSTAGS.get(t, t)
                    gps_data[sub_tag] = value[t]
                exif_data["GPS"] = gps_data
            else:
                exif_data[tag] = value
        return exif_data

    def _get_lat_lon(self, exif_data: Dict) -> Tuple[Optional[float], Optional[float]]:
        """Returns the latitude and longitude, if available, from the provided Exif data."""
        gps_info = exif_data.get("GPS", {})
        
        def _convert_to_degrees(value):
            """Helper function to convert the GPS coordinates stored in the EXIF to degrees in float format"""
            d = value[0] if isinstance(value[0], float) or isinstance(value[0], int) else float(value[0])
            m = value[1] if isinstance(value[1], float) or isinstance(value[1], int) else float(value[1])
            s = value[2] if isinstance(value[2], float) or isinstance(value[2], int) else float(value[2])
            return d + (m / 60.0) + (s / 3600.0)

        lat = None
        lon = None

        if "GPSLatitude" in gps_info and "GPSLatitudeRef" in gps_info:
            lat = _convert_to_degrees(gps_info["GPSLatitude"])
            if gps_info["GPSLatitudeRef"] != "N":
                lat = -lat

        if "GPSLongitude" in gps_info and "GPSLongitudeRef" in gps_info:
            lon = _convert_to_degrees(gps_info["GPSLongitude"])
            if gps_info["GPSLongitudeRef"] != "E":
                lon = -lon

        return lat, lon

    def _get_geohash(self, lat: float, lon: float, precision: int = 6) -> str:
        """Simple Geohash implementation to avoid complex dependencies if pip fails."""
        # Using a simple encoding for now or a placeholder if library missing.
        # Actually, let's just return a simple str representation if geohash lib is missing
        # But wait, I added python-geohash. 
        try:
            import Geohash
            return Geohash.encode(lat, lon, precision)
        except ImportError:
            # Fallback simple string
            return f"{lat:.2f},{lon:.2f}"

    def submit_claim(self, claim_data: Dict, image_file_path: str) -> Dict:
        """
        Validates and adds a claim.
        Returns Dict with success status and any warnings/errors.
        """
        # 1. Duplicate Fund Check
        fund_id = claim_data.get("fund_id")
        existing_claim = next((c for c in self.claims if c.get("fund_id") == fund_id), None)
        if existing_claim:
             return {
                "success": False,
                "error": "Duplicate Claim Detected",
                "details": f"Fund ID {fund_id} has already been claimed by {existing_claim.get('claimant_name')} on {existing_claim.get('timestamp')}."
            }

        # 2. Image Processing
        try:
            img = Image.open(image_file_path)
            
            # 2a. Duplicate Photo Check (Perceptual Hash)
            img_hash = str(imagehash.phash(img))
            
            # Check against existing hashes
            for c in self.claims:
                if c.get("image_hash") == img_hash:
                     return {
                        "success": False,
                        "error": "Duplicate Photo Detected",
                        "details": f"This photo was already used in claim for Fund ID {c.get('fund_id')}."
                    }
            
            # 2b. Metadata Extraction
            exif = self._get_exif_data(img)
            lat, lon = self._get_lat_lon(exif)

            # Prioritize manual lat/long from trusted frontend source (Camera API)
            if claim_data.get("latitude") is not None and claim_data.get("longitude") is not None:
                lat = float(claim_data["latitude"])
                lon = float(claim_data["longitude"])

            geohash = self._get_geohash(lat, lon) if lat and lon else "UNKNOWN"
            
            timestamp = datetime.now().isoformat()
            
            # 4. Mock Cloud Upload (S3)
            # In a real app, we would upload 'image_path' to S3 and get the URL.
            # Here, our Mock Service simulates that latency and returns a fake S3 URL.
            s3_url = mock_s3.upload_file(image_file_path)
            
            new_claim = {
                "claim_id": f"CLM-{len(self.claims) + 1000}",
                "fund_id": fund_id,
                "amount": claim_data.get("amount"),
                "claimant_name": claim_data.get("claimant_name"),
                "description": claim_data.get("description"),
                "timestamp": timestamp,
                "image_path": image_file_path,  # Keep local path for serving
                "s3_url": s3_url, # Storing the "Cloud" URL for audit trail
                "image_hash": img_hash,
                "location": {
                    "latitude": lat,
                    "longitude": lon,
                    "geohash": geohash
                },
                "status": "Pending Community Verification",
                "community_votes": {
                    "approvals": 0,
                    "rejections": 0,
                    "reminders": 0
                }
            }
            
            self.claims.append(new_claim)
            self.save_claims()
            
            return {
                "success": True, 
                "message": "Claim submitted successfully", 
                "claim_id": new_claim["claim_id"],
                "warnings": [] if lat else ["No GPS data found in photo."]
            }

        except Exception as e:
            return {"success": False, "error": "Image Processing Failed", "details": str(e)}

    def get_all_claims(self):
        return self.claims

    def update_claim_status(self, claim_id: str, action: str, notes: str = ""):
        claim = next((c for c in self.claims if c["claim_id"] == claim_id), None)
        if not claim:
            return False, "Claim not found"
        
        if action == "approve":
            claim["community_votes"]["approvals"] += 1
        elif action == "reject":
            claim["community_votes"]["rejections"] += 1
        elif action == "remind":
            claim["community_votes"]["reminders"] += 1
            # Simulate AI Reminder
            claim["ai_reminder_sent"] = True
            claim["last_reminder"] = datetime.now().isoformat()
        
        # Simple threshold logic
        if claim["community_votes"]["approvals"] > 2:
            claim["status"] = "Verified"
        elif claim["community_votes"]["rejections"] > 2:
            claim["status"] = "Rejected"
            
        self.save_claims()
        return True, "Vote recorded"

# Singleton instance
claims_manager = ClaimsManager()
