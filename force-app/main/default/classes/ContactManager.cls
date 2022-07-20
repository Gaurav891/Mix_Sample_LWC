public with sharing class ContactManager {

    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactAllList(String accountId){
        return [select id,Account.Name ,Phone,LastName,Email from Contact where  AccountId =:accountId];     
    }

   /* @AuraEnabled(cacheable=true)
    public static List<Contact> getContactList(String searchKey,String accountId){
        
        String Key= '%' +searchKey+ '%';
        return [select id,Account.Name ,Phone,LastName,Email from Contact where
                       LastName like :Key 
                       AND 
                       AccountId =:accountId];
        
    }
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountList(){
        
        return [select id,Name ,Phone from Account limit 10];
                      
        
    }*/


}
