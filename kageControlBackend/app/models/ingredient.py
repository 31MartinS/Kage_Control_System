from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    stock = Column(Float)

    dishes = relationship("DishIngredient", back_populates="ingredient")

class DishIngredient(Base):
    __tablename__ = "dish_ingredients"
    dish_id = Column(Integer, ForeignKey("dishes.id"), primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), primary_key=True)
    quantity_needed = Column(Float)

    dish = relationship("Dish", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="dishes")
