"""add trip cover image

Revision ID: 9d6955a3744a
Revises: ba08c026e820
Create Date: 2026-09-14 19:34:33.323991

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9d6955a3744a'
down_revision: Union[str, Sequence[str], None] = 'ba08c026e820'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
