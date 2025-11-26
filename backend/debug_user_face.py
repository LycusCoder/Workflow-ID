#!/usr/bin/env python3
"""
Debug script untuk cek face_embedding user
"""
from models import SessionLocal, User
import json

def check_user_face_embedding(user_id: int = 1):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            print(f"❌ User dengan ID {user_id} tidak ditemukan!")
            return
        
        print(f"\n{'='*60}")
        print(f"👤 USER INFO")
        print(f"{'='*60}")
        print(f"ID: {user.id}")
        print(f"Name: {user.name}")
        print(f"Email: {user.email}")
        print(f"Gender: {user.gender}")
        print(f"{'='*60}\n")
        
        if not user.face_embedding:
            print("❌ MASALAH DITEMUKAN!")
            print("   User ini BELUM memiliki face_embedding di database!")
            print("   Silakan REGISTRASI ULANG dengan face recognition.")
            print(f"\n{'='*60}\n")
            return
        
        # Try to parse face_embedding
        try:
            embedding = json.loads(user.face_embedding)
            print(f"✅ Face embedding ditemukan!")
            print(f"   Tipe: {type(embedding)}")
            print(f"   Jumlah dimensi: {len(embedding) if isinstance(embedding, list) else 'Not a list'}")
            
            if isinstance(embedding, list) and len(embedding) > 0:
                print(f"   Sample (10 nilai pertama): {embedding[:10]}")
                print(f"   Min value: {min(embedding):.4f}")
                print(f"   Max value: {max(embedding):.4f}")
                print(f"\n✅ Face embedding VALID!")
            else:
                print(f"\n❌ Face embedding INVALID (empty list)!")
                
        except json.JSONDecodeError as e:
            print(f"❌ Face embedding corrupt! Error: {e}")
            print(f"   Raw data (first 100 chars): {user.face_embedding[:100]}")
        
        print(f"\n{'='*60}\n")
        
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🔍 Memeriksa face embedding user...\n")
    check_user_face_embedding(user_id=1)
