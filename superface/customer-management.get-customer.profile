name = "customer-management/get-customer"
version = "0.0.0"

"Retrieves a single customer by their ID."
usecase RetrieveCustomer safe  {
  input {  
    "The ID of the customer to retrieve."
    customer_id! string!
  
    "Comma-separated list of field names to show in the response."
    fields string!
  }
  result {
    "The new customer object."
    customer {
      "The customer's ID."
      id! number!
    
      "The unique email address of the customer. Attempting to assign the same email address to multiple customers returns an error."
      email! string!
    
      "The date and time (ISO 8601 format) when the customer was created."
      created_at! string!
    
      "The date and time (ISO 8601 format) when the customer information was last updated."
      updated_at! string!
    
      first_name! string!
    
      last_name! string!
    
      orders_count! number!
    
      state! string!

      "The total amount of money that the customer has spent across their order history."
      total_spent! string!
    
      last_order_id! number!
    
     "A note about the customer."
      note string

      "Whether the customer has verified their email address."
      verified_email! boolean!

      "A unique identifier for the customer that's used with Multipass login."
      multipass_identifier string
    
      "Whether the customer is exempt from paying taxes on their order. If true, then taxes won't be applied to an order at checkout. If false, then taxes will be applied at checkout."
      tax_exempt! boolean!

      "Tags that the shop owner has attached to the customer, formatted as a string of comma-separated values. A customer can have up to 250 tags. Each tag can have up to 255 characters."
      tags! string!
    
      "The name of the customer's last order. This is directly related to the name field on the Order resource."
      last_order_name! string!
    
      "The three-letter code (ISO 4217 format) for the currency that the customer used when they paid for their last order. Defaults to the shop currency. Returns the shop currency for test orders."
      currency! string!
    
      "The unique phone number (E.164 format) for this customer. Attempting to assign the same phone number to multiple customers returns an error."
      phone! string!
    
      addresses! [{
        id! number!
      
        customer_id! number!
      
        first_name string
      
        last_name string
      
        company string
      
        address1! string!
      
        address2 string!
      
        city! string!
      
        province! string!
      
        country! string!
      
        zip! string!
      
        phone! string!
      
        name! string!
      
        province_code! string!
      
        country_code! string!
      
        country_name! string!
      
        default! boolean!
      }!]!
        
      tax_exemptions [string!]!
    
      "The marketing consent information when the customer consented to receiving marketing material by email. The email property is required to create a customer with email consent information and to update a customer for email consent that doesn't have an email recorded. The customer must have a unique email address associated to the record. The email marketing consent has the following properties:"
      email_marketing_consent! {
        state! string!
      
        opt_in_level string
      
        consent_updated_at! string!
      }!
    
      "The marketing consent information when the customer consented to receiving marketing material by SMS. The phone property is required to create a customer with SMS consent information and to perform an SMS update on a customer that doesn't have a phone number recorded. The customer must have a unique phone number associated to the record. The SMS marketing consent has the following properties:"
      sms_marketing_consent! {
        state! string!
      
        opt_in_level! string!
      
        consent_updated_at! string!
      
        consent_collected_from! string!
      }!
    
      admin_graphql_api_id! string!
    
      "The default address for the customer."
      default_address! {
        id! number!
      
        customer_id! number!
      
        first_name string
      
        last_name string
      
        company string
      
        address1! string!
      
        address2 string!
      
        city! string!
      
        province! string!
      
        country! string!
      
        zip! string!
      
        phone! string!
      
        name! string!
      
        province_code! string!
      
        country_code! string!
      
        country_name! string!
      
        default! boolean!
      }!
    }!
  }!
  error {
    "Error message describing the reason for the failed operation."
    errors! string!
  
    "HTTP status code associated with the error."
    status! number!
  
    "Number of seconds to wait before retrying the query, applicable for 429 Too Many Requests error."
    retryAfter number
  
    "API call limit information, showing the number of requests made and the total number allowed per minute."
    xShopifyShopApiCallLimit string
  }!
  example InputExample {
    input {
      customer_id = '207119551',
      fields = 'id,email,first_name,last_name',
    }
  }
}
