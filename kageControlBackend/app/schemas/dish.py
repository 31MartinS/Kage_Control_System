from pydantic import BaseModel, ConfigDict
from typing import List
from app.schemas.ingredient import DishIngredientCreate

class DishBase(BaseModel):
    name: str
    description: str
    price: float

class DishCreate(DishBase):
    ingredients: List[DishIngredientCreate]

class Dish(DishBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class DishSchema(BaseModel):
    id: int
    name: str
    price: float

    model_config = ConfigDict(from_attributes=True)
