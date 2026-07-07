"""
base_service.py - Base service class for dependency injection and common operations
"""
from typing import TypeVar, Generic, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

T = TypeVar('T')


class BaseService(Generic[T]):
    """Generic base service for CRUD operations with filtering, sorting, and pagination"""
    
    def __init__(self, db: Session, model: type):
        self.db = db
        self.model = model
    
    def create(self, obj_in: Dict[str, Any]) -> T:
        """Create a new object"""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def get_by_id(self, id: str) -> Optional[T]:
        """Get object by ID"""
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        filters: Optional[Dict[str, Any]] = None
    ) -> tuple[List[T], int]:
        """Get all objects with pagination and filtering"""
        query = self.db.query(self.model)
        
        # Apply filters
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key) and value is not None:
                    query = query.filter(getattr(self.model, key) == value)
        
        # Get total count
        total = query.count()
        
        # Apply sorting
        if hasattr(self.model, sort_by):
            sort_column = getattr(self.model, sort_by)
            if sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        return query.all(), total
    
    def update(self, id: str, obj_in: Dict[str, Any]) -> Optional[T]:
        """Update an object"""
        db_obj = self.get_by_id(id)
        if not db_obj:
            return None
        
        for key, value in obj_in.items():
            if hasattr(db_obj, key):
                setattr(db_obj, key, value)
        
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def delete(self, id: str) -> bool:
        """Soft delete or hard delete an object"""
        db_obj = self.get_by_id(id)
        if not db_obj:
            return False
        
        if hasattr(db_obj, 'is_deleted'):
            db_obj.is_deleted = True
            self.db.add(db_obj)
        else:
            self.db.delete(db_obj)
        
        self.db.commit()
        return True
    
    def search(
        self,
        search_term: str,
        search_fields: List[str],
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[T], int]:
        """Full-text search on specified fields"""
        from sqlalchemy import or_
        
        query = self.db.query(self.model)
        
        # Build OR filter for search fields
        or_conditions = []
        for field in search_fields:
            if hasattr(self.model, field):
                or_conditions.append(
                    getattr(self.model, field).ilike(f"%{search_term}%")
                )
        
        if or_conditions:
            query = query.filter(or_(*or_conditions))
        
        total = query.count()
        results = query.offset(skip).limit(limit).all()
        
        return results, total
