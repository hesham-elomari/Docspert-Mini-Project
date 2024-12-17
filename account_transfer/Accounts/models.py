from django.db import models
import uuid

# Create your models here.
class Accounts(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    balance = models.TextField(max_length=1000)

    class Meta:
        db_table = 'accounts'

    def __str__(self):
        return str(self.name)