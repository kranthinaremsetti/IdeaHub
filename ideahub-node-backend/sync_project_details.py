import json
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/ideahub")
client = MongoClient(MONGODB_URI)
db = client.get_default_database()
projects_collection = db.projects

# Load demo projects data
with open("data/demo_projects.json") as f:
    demo_projects = json.load(f)

def sync_limitations_and_improvements():
    """Sync limitations and future_improvements from demo_projects.json to existing projects"""
    updated = 0
    
    for demo_project in demo_projects:
        title = demo_project.get("project_title")
        limitations = demo_project.get("limitations", [])
        future_improvements = demo_project.get("future_improvements", [])
        
        # Try to find existing project by title
        existing = projects_collection.find_one({"project_info.project_title": title})
        
        if existing:
            # Update with limitations and future_improvements
            result = projects_collection.update_one(
                {"_id": existing["_id"]},
                {
                    "$set": {
                        "project_info.limitations": limitations,
                        "project_info.future_improvements": future_improvements
                    }
                }
            )
            
            if result.modified_count > 0:
                print(f"✓ Updated: {title}")
                updated += 1
            else:
                print(f"~ Already has data: {title}")
        else:
            print(f"✗ Not found in DB: {title}")
    
    print(f"\n✓ Total updated: {updated} projects")

if __name__ == "__main__":
    sync_limitations_and_improvements()
