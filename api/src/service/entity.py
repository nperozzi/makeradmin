from flask import request
from sqlalchemy import inspect

from service.db import db_session
from service.error import NotFound
from service.logging import logger


class Entity:
    """ Used to create a crud-able entity, subclass to provide additional functionality. """
    
    def __init__(self, model):
        self.model = model

        model_inspect = inspect(self.model)
        assert len(model_inspect.primary_key) == 1, "this class only supports single column primary keys"
        
        self.pk = model_inspect.primary_key[0]
     
    @staticmethod
    def validate(entity):
        entity.validate()
        
    def list(self):
        # TODO Implement pagination.
        # TODO Implement filters.
        # TODO Sort.
        logger.info(f"list {self.model.__name__}")
        return [o.json() for o in db_session.query(self.model).filter(self.model.deleted_at.is_(None))]

    def create(self):
        # "status": "created",
        # "data": {
        # "parent": 0,
        # "name": "g1",
        # "title": "g1",
        # "description": null,
        # "group_id": 4,
        # "entity_id": 4
        # },
        # "metadata": {
        # "service": "Membership service",
        # "version": "1.0",
        # "date": "2019-01-01T22:22:17Z"
        # }
        logger.info(f"create {self.model.__name__}: {request.get_data()}")
        # TODO Automate validation of input before creating object.
        entity = self.model(**request.json)
        self.validate(entity)
        db_session.add(entity)
        db_session.commit()
        return entity.json()
        
    def read(self, entity_id):
        # TODO Catch not found.
        logger.info(f"read {entity_id} {self.model.__name__}")
        obj = db_session.query(self.model).get(entity_id)
        if not obj:
            raise NotFound("Could not find any entity with specified parameters.")
        return obj.json()

    def update(self, entity_id):
        # TODO Test changing id.
        # TODO Same as create.
        entity = db_session.query(self.model).get(entity_id)
        for k, v in request.json().items():
            setattr(entity, k, v)
        db_session.commit()
        logger.info(f"update {entity_id} {self.model.__name__}")
        return entity.json()

    def delete(self, entity_id):
        logger.info(f"delete {entity_id} {self.model.__name__}")
        # TODO What if not exists?
        count = db_session.query(self.model).filter(self.pk == entity_id).delete()
        
