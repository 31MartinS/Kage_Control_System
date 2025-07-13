from pydantic import BaseModel, ConfigDict

class IngredientBase(BaseModel):
    name: str
    stock: float

class IngredientCreate(IngredientBase): pass

class Ingredient(IngredientBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class DishIngredientCreate(BaseModel):
    ingredient_id: int
    quantity_needed: float
