name = "product-management/product-update"
version = "0.0.0"

"Updates an existing product with new information."
usecase UpdateProduct idempotent  {
  input {
    product! {
      "The description of the product."
      body_html string!
    
      "A unique human-readable string for the product."
      handle! string!
    
      "The unique numeric identifier for the product."
      id! number!
    
      images [{
        "The unique numeric identifier for the image."
        id! number!
      
        "The unique numeric identifier for the product."
        product_id! number!
      
        "The position of the image in the product's image list."
        position! number!
      
        "The URL of the image."
        src! string!
      }!]!
    
      options {
        "The unique numeric identifier for the option."
        id! number!
      
        "The unique numeric identifier for the product."
        product_id! number!
      
        "The name of the option."
        name! string!
      
        "The position of the option in the product's option list."
        position! number!
      
        values! [string!]!
      }!
    
      "The type of the product."
      product_type string!
    
      "The status of the product."
      status! string!
    
      "A string of comma-separated tags."
      tags string!
    
      "The suffix of the Liquid template used for the product page."
      template_suffix string!
    
      "The title of the product."
      title! string!
    
      variants [{
        "The unique numeric identifier for the variant."
        id! number!
      
        "The unique numeric identifier for the product."
        product_id! number!
      
        "The value of the first option."
        option1! string!
      
        "The position of the variant in the product's variant list."
        position! number!
      
        "The price of the variant."
        price! number!
      
        "A unique identifier for the variant."
        sku! string!
      
        "The title of the variant."
        title! string!
      }!]!
    
      "The name of the product's vendor."
      vendor! string!
    }!
  }
  result {
    product {
      body_html string!
    
      created_at string!
    
      handle string!
    
      id number!
    
      images [{
        id number!
      
        product_id number!
      
        position number!
      
        created_at string!
      
        updated_at string!
      
        width number!
      
        height number!
      
        src string!
      
        variant_ids [{
        }!]!
      }!]!
    
      options {
        id number!
      
        product_id number!
      
        name string!
      
        position number!
      
        values [string!]!
      }!
    
      product_type string!
    
      published_at string!
    
      published_scope string!
    
      status string!
    
      tags string!
    
      template_suffix string!
    
      title string!
    
      updated_at string!
    
      variants [{
        barcode string!
      
        compare_at_price None
      
        created_at string!
      
        fulfillment_service string!
      
        grams number!
      
        weight number!
      
        weight_unit string!
      
        id number!
      
        inventory_item_id number!
      
        inventory_management string!
      
        inventory_policy string!
      
        inventory_quantity number!
      
        option1 string!
      
        position number!
      
        price number!
      
        product_id number!
      
        requires_shipping boolean!
      
        sku string!
      
        taxable boolean!
      
        title string!
      
        updated_at string!
      }!]!
    
      vendor string!
    }!
  }!
  error {
    "An array of error messages."
    errors! [string!]!
  
    "HTTP status code of the error."
    status number
  
    "The number of requests made and the total number allowed per minute."
    xShopifyShopApiCallLimit string
  
    "The number of seconds to wait until retrying the query."
    retryAfter number
  }!
  example InputExample {
    input {
      product = {
        body_html = "It's the small iPod with a big idea: Video.",
        handle = 'ipod-nano',
        id = 632910392,
        images = [
          {
          id = 850703190,
          product_id = 632910392,
          position = 1,
          src = 'http://example.com/burton.jpg',
        }
        ],
        options = {
          id = 594680422,
          product_id = 632910392,
          name = 'Color',
          position = 1,
          values = [
            'Pink'
          ],
        },
        product_type = 'Cult Products',
        status = 'active',
        tags = 'Emotive, Flash Memory, MP3, Music',
        template_suffix = 'special',
        title = 'IPod Nano - 8GB',
        variants = [
          {
          id = 808950810,
          product_id = 632910392,
          option1 = 'Pink',
          position = 1,
          price = 199.99,
          sku = 'IPOD2008PINK',
          title = 'Pink',
        }
        ],
        vendor = 'Apple',
      },
    }
  }
}
