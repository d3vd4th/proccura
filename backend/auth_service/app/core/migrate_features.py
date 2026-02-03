"""
Migration script to:
1. Create the features table
2. Add feature_id column to permissions table
3. Migrate data from feature (string) to feature_id (FK)
4. Drop the old feature column
"""
from sqlalchemy import text
from app.core.database import SessionLocal, engine, DB_SCHEMA
from app.models.feature import Feature


FEATURES = [
    ("tenant", "Tenant Management", "Manage tenants and organizations"),
    ("user", "User Management", "Manage users and their accounts"),
    ("role", "Role Management", "Manage roles and permissions"),
    ("vendor", "Vendor Management", "Manage vendors and suppliers"),
    ("po", "Purchase Orders", "Manage purchase orders"),
    ("report", "Reports", "View and export reports"),
    ("ai", "AI Features", "AI-powered insights and features"),
]


def run_migration():
    db = SessionLocal()
    
    try:
        # Step 1: Create features table if not exists
        print("Step 1: Creating features table...")
        db.execute(text(f"""
            CREATE TABLE IF NOT EXISTS {DB_SCHEMA}.features (
                id VARCHAR(36) PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                description VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            )
        """))
        db.commit()
        print("✔ Features table created")

        # Step 2: Insert features
        print("Step 2: Seeding features...")
        feature_map = {}
        for code, name, description in FEATURES:
            # Check if feature exists
            result = db.execute(
                text(f"SELECT id FROM {DB_SCHEMA}.features WHERE code = :code"),
                {"code": code}
            ).fetchone()
            
            if result:
                feature_map[code] = result[0]
            else:
                import uuid
                feature_id = str(uuid.uuid4())
                db.execute(
                    text(f"""
                        INSERT INTO {DB_SCHEMA}.features (id, code, name, description)
                        VALUES (:id, :code, :name, :description)
                    """),
                    {"id": feature_id, "code": code, "name": name, "description": description}
                )
                feature_map[code] = feature_id
        
        db.commit()
        print(f"✔ {len(feature_map)} features seeded")

        # Step 3: Check if feature_id column exists, if not add it
        print("Step 3: Adding feature_id column to permissions...")
        result = db.execute(text(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = '{DB_SCHEMA}' 
            AND table_name = 'permissions' 
            AND column_name = 'feature_id'
        """)).fetchone()

        if not result:
            db.execute(text(f"""
                ALTER TABLE {DB_SCHEMA}.permissions 
                ADD COLUMN feature_id VARCHAR(36) REFERENCES {DB_SCHEMA}.features(id)
            """))
            db.commit()
            print("✔ feature_id column added")
        else:
            print("✔ feature_id column already exists")

        # Step 4: Migrate data from feature to feature_id
        print("Step 4: Migrating feature data to feature_id...")
        for feature_code, feature_id in feature_map.items():
            db.execute(
                text(f"""
                    UPDATE {DB_SCHEMA}.permissions 
                    SET feature_id = :feature_id 
                    WHERE feature = :feature_code AND (feature_id IS NULL OR feature_id = '')
                """),
                {"feature_id": feature_id, "feature_code": feature_code}
            )
        db.commit()
        print("✔ Data migrated")

        # Step 5: Drop old feature column
        print("Step 5: Dropping old feature column...")
        result = db.execute(text(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = '{DB_SCHEMA}' 
            AND table_name = 'permissions' 
            AND column_name = 'feature'
        """)).fetchone()

        if result:
            db.execute(text(f"""
                ALTER TABLE {DB_SCHEMA}.permissions 
                DROP COLUMN feature
            """))
            db.commit()
            print("✔ Old feature column dropped")
        else:
            print("✔ Old feature column already removed")

        print("\n✅ Migration completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_migration()
