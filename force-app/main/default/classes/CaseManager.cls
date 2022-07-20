public with sharing class CaseManager {
    @AuraEnabled(cacheable=true)
    public static List<Case> fetchCase(){
        return [select id,Status,CaseNumber,Priority
                 from 
                 Case Limit 5];
    }
}
