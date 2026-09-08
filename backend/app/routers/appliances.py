from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..models import Appliance


router = APIRouter(
    prefix="/appliances",
    tags=["Appliances"]
)


# -----------------------------------------
# Request schema
# -----------------------------------------

class ApplianceStatusUpdate(BaseModel):
    status: str


# -----------------------------------------
# Get all appliances
# -----------------------------------------

@router.get("/")
def get_appliances(
    db: Session = Depends(get_db)
):

    appliances = (
        db.query(Appliance)
        .order_by(Appliance.id)
        .all()
    )

    return appliances


# -----------------------------------------
# Get one appliance
# -----------------------------------------

@router.get("/{appliance_id}")
def get_appliance(
    appliance_id: int,
    db: Session = Depends(get_db)
):

    appliance = (
        db.query(Appliance)
        .filter(
            Appliance.id == appliance_id
        )
        .first()
    )

    if not appliance:

        raise HTTPException(
            status_code=404,
            detail="Appliance not found"
        )

    return appliance


# -----------------------------------------
# Update appliance status
# -----------------------------------------

@router.put("/{appliance_id}/status")
def update_appliance_status(
    appliance_id: int,
    data: ApplianceStatusUpdate,
    db: Session = Depends(get_db)
):

    appliance = (
        db.query(Appliance)
        .filter(
            Appliance.id == appliance_id
        )
        .first()
    )

    if not appliance:

        raise HTTPException(
            status_code=404,
            detail="Appliance not found"
        )


    status = data.status.upper()


    if status not in ["ON", "OFF"]:

        raise HTTPException(
            status_code=400,
            detail="Status must be ON or OFF"
        )


    appliance.status = status

    db.commit()

    db.refresh(appliance)


    return {
        "message": "Appliance status updated successfully",
        "appliance_id": appliance.id,
        "name": appliance.name,
        "status": appliance.status
    }