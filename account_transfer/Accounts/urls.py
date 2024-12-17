from django.contrib import admin
from django.urls import path
from . import views
urlpatterns = [

    # import the csv file
    path('importcsv/',views.ImportFiles.as_view(),name="importcsv"),
    path('list_all_accounts/',views.Account_List.as_view(),name="list_all_accounts"),
    path('get_account_details/',views.Account_Details.as_view(),name="get_account_details"),
    path('transfer_to/',views.Transfer_To.as_view(),name="transfer_to"),

]