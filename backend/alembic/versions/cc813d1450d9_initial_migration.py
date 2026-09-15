"""initial migration

Revision ID: cc813d1450d9
Revises: 
Create Date: 2026-09-13 23:53:18.543678

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cc813d1450d9'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'cities',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('country', sa.String(100), nullable=True),
        sa.UniqueConstraint('name'),
    )
    op.create_table(
        'places',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('category', sa.String(50), nullable=True),
        sa.Column('city_id', sa.Integer(), sa.ForeignKey('cities.id'), nullable=False),
    )
    # travel_style and cover_image_url are added by later revisions.
    op.create_table(
        'trips',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('city_id', sa.Integer(), sa.ForeignKey('cities.id'), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('start_date', sa.String(20), nullable=True),
        sa.Column('end_date', sa.String(20), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('budget', sa.Float(), nullable=True),
    )
    op.create_table(
        'visits',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('place_id', sa.Integer(), sa.ForeignKey('places.id'), nullable=False),
        sa.Column('trip_id', sa.Integer(), sa.ForeignKey('trips.id'), nullable=False),
        sa.Column('day_number', sa.Integer(), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=True),
        sa.Column('cost', sa.Float(), nullable=True),
        sa.Column('expense_category', sa.String(50), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('visited_at', sa.String(20), nullable=True),
        sa.Column('duration', sa.String(50), nullable=True),
        sa.Column('recommended', sa.Boolean(), nullable=True),
        sa.Column('photo_url', sa.String(500), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('visits')
    op.drop_table('trips')
    op.drop_table('places')
    op.drop_table('cities')
