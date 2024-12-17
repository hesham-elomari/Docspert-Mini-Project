
from Accounts.models import Accounts
from decimal import Decimal
from django.db import transaction
from rest_framework.response import Response
import pandas as pd
import os
from rest_framework import status



def status_success(status,message_en,message_ar,data,errors,serializer_Error = False):
    data={
        'status':status,
        'message':message_en,
        'data':data,
        'errors':errors,
        'serializer_error':serializer_Error
    }
    return data

def transfer_data(data):

    from_account = Accounts.objects.get(id = data['id_from'])
    to_account = Accounts.objects.get(id = data['id_to'])
    error = ""

    try:
        with transaction.atomic():
            from_account.balance = str(Decimal(from_account.balance) - Decimal(data['balance_from']))
            from_account.save()
            to_account.balance = str( Decimal(to_account.balance) + Decimal( data['balance_from']))
            to_account.save()
    except Exception as err:
        error = err
        return to_account,error


    
    return to_account,error

def import_to_table(files):
    current_dir = os.getcwd()
    error_cause = ""
    for file in files:
        
        file_path = os.path.join(current_dir, file.name)
        with open(file_path, 'wb') as f:
            for chunk in file.chunks():
                f.write(chunk)

        try:
            # Process the file (CSV or Excel)
            if file.name.endswith('.xlsx') or file.name.endswith('.xls'):
                data = pd.read_excel(file_path)
            else:
                data = pd.read_csv(file_path)

            # only create if record does not exist
            for index, row in data.iterrows():
                try:
                    balance_written = Decimal(row.get('Balance'))
                except Exception as err:
                    balance_written = 0

                Accounts.objects.get_or_create(id=row.get('ID'),name=row.get('Name'),balance = balance_written)

            os.remove(file_path)
        except Exception as err:
            error_cause = "Error in importing file "+str(file.name)+" because of : "+str(err)            
            os.remove(file_path)
            
    return error_cause

    
    
            

    

    