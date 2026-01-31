import time
import os
import random
import uuid

class MockS3Service:
    def __init__(self, bucket_name="govguard-audit-evidence", region="ap-south-1"):
        self.bucket_name = bucket_name
        self.region = region
        print(f"✅ [MOCK-CLOUD] Initialized Connection to AWS S3 Control Plane ({region})")

    def upload_file(self, file_path: str, object_name: str = None) -> str:
        """
        Simulates an S3 upload. 
        In reality, the file is already saved locally by FastAPI.
        This function generates the S3 URL and logs the 'upload' latency.
        """
        if object_name is None:
            object_name = os.path.basename(file_path)

        # Simulate Network Latency (Cloud Upload)
        latency = random.uniform(0.1, 0.4)
        time.sleep(latency)

        # Generate a realistic S3 Object URL
        s3_url = f"https://s3.{self.region}.amazonaws.com/{self.bucket_name}/{object_name}"
        
        # Log the "Event"
        print(f"🚀 [MOCK-CLOUD] Uploading {object_name} to bucket '{self.bucket_name}'...")
        print(f"☁️ [MOCK-CLOUD] Transfer Complete. ETag: {uuid.uuid4().hex}")
        print(f"🔗 [MOCK-CLOUD] Public URL: {s3_url}")

        return s3_url

# Singleton Instance
mock_s3 = MockS3Service()
