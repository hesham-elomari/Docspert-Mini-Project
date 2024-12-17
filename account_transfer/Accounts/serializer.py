from rest_framework import serializers
from Accounts.models import Accounts
from django.db.models import Q
from django.core.exceptions import ValidationError
from decimal import Decimal



# data to display
class Account_List_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Accounts
        fields = ["id","name","balance"]

# check if certain id or name exists
class Account_Detail_Serializer(serializers.Serializer):
    search = serializers.CharField(min_length=1)

    def validate(self,data):
        search = data.get('search')
        accounts = Accounts.objects.filter(Q(id__icontains=search)|Q(name__icontains=search)).order_by('name')
        if not accounts.exists():
            raise serializers.ValidationError("The account you're searching for with certain id or name" +f" {search} "+ "does not exist")
        self.accounts = accounts
        return data
    
# validating data before applying transactions
class Transfer_Serializer(serializers.Serializer):
    id_from      = serializers.UUIDField(format='hex_verbose')
    balance_from = serializers.FloatField(min_value=0.0)
    id_to        = serializers.UUIDField(format='hex_verbose')

    def validate(self, data):

        id_from = data.get('id_from')
        balance_from = data.get('balance_from')
        id_to = data.get('id_to')

        from_account = Accounts.objects.filter(id=id_from).first()
        to_account = Accounts.objects.filter(id=id_to).first()

        if not from_account:
            raise serializers.ValidationError("The account with the id" +f" {id_from} "+ "does not exist")
        else:
            if Decimal(from_account.balance) < Decimal(balance_from):
                raise serializers.ValidationError("You do not have enough balance to transfer")
            
        if not to_account:
            raise serializers.ValidationError("The account with the id" +f" {id_to} "+ "does not exist")
        
        if from_account == to_account:
            raise serializers.ValidationError("Can not transfer to the same person")
        
        return data

# file Serializer

class ImportFile_Serializer(serializers.Serializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        required=False
    )








