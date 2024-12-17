from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from Accounts.serializer import Account_List_Serializer,Account_Detail_Serializer,Transfer_Serializer,ImportFile_Serializer
from django.http import JsonResponse
from Accounts.models import Accounts
from rest_framework import status
from django.db.models import Q
from Accounts.services import status_success,transfer_data,import_to_table

# Import csv or xslx format files
class ImportFiles(APIView):
    def post(self, request):
        serializer = ImportFile_Serializer(data=request.data)
        if not serializer.is_valid():
            return Response(status_success(status.HTTP_400_BAD_REQUEST,'Pleas upload a file or multiple files','خطأ في معالجت الملفات',[],serializer.errors,True), status=status.HTTP_400_BAD_REQUEST)
        else:
            files = serializer.validated_data.get('files', None)
            if files is None:
                file = request.FILES.get('file')
                if file:
                    files = [file]

            if not files:
                return Response(status_success(status.HTTP_400_BAD_REQUEST,'no files found','',[],serializer.errors), status=status.HTTP_400_BAD_REQUEST)
            try:
                error = import_to_table(files)
                if len(str(error)) > 0:
                    return Response(status_success(status.HTTP_400_BAD_REQUEST,str(error),str(error),[],str(error)), status=status.HTTP_400_BAD_REQUEST)
                
            except Exception as err:
                return Response(status_success(status.HTTP_400_BAD_REQUEST,'Error proccessing files','',[],str(err)), status=status.HTTP_400_BAD_REQUEST)
        return Response(status_success(status.HTTP_200_OK,'Success', 'نجح',{},[]), status=status.HTTP_200_OK)

# Show all accounts
class Account_List(APIView):
    def get(self,request):
        try:
            accounts =Accounts.objects.all().order_by('name')
            serializer = Account_List_Serializer(accounts, many=True)
            json_data = serializer.data
        except Exception as err:
            return Response(status_success(status.HTTP_400_BAD_REQUEST,'Invalid Data',' خطأ في البينات',[],str(err)), status=status.HTTP_400_BAD_REQUEST)
        return Response(status_success(status.HTTP_200_OK,'Success', 'نجح',json_data,[]), status=status.HTTP_200_OK)
    
# Show account with certain id or name
class Account_Details(APIView):
    def get(self,request):
        serializer = Account_Detail_Serializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(status_success(status.HTTP_400_BAD_REQUEST,'Invalid Data',' خطأ في البينات',[],serializer.errors,True), status=status.HTTP_400_BAD_REQUEST)

        try:
            accounts = serializer.accounts
            serializer = Account_List_Serializer(accounts, many=True)
            json_data = serializer.data
        except Exception as err:
            return Response(status_success(status.HTTP_400_BAD_REQUEST,'Invalid Data',' خطأ في البينات',[],str(err)), status=status.HTTP_400_BAD_REQUEST)
        return Response(status_success(status.HTTP_200_OK,'Success', 'نجح',json_data,[]), status=status.HTTP_200_OK)

# Transfer between two accounts
class Transfer_To(APIView):
    def post(self,request):
        serializer = Transfer_Serializer(data=request.data)
        if not serializer.is_valid():
            return Response(status_success(status.HTTP_400_BAD_REQUEST,'Transfer Failed',' خطأ في البينات',[],serializer.errors,True), status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                value,error = transfer_data(serializer.validated_data)
                if len(error) > 0:
                    return Response(status_success(status.HTTP_400_BAD_REQUEST,'Transaction failure',' خطأ في التحويل',[],str(error)), status=status.HTTP_400_BAD_REQUEST)

            except Exception as err:
                return Response(status_success(status.HTTP_400_BAD_REQUEST,'Transaction failure',' خطأ في التحويل',[],str(err)), status=status.HTTP_400_BAD_REQUEST)

        return Response(status_success(status.HTTP_200_OK,'Success', 'نجح',{},[]), status=status.HTTP_200_OK)



    


