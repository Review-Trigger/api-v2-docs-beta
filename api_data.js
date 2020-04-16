define({ "api": [
  {
    "name": "API_Request_Signature",
    "group": "Authentication",
    "version": "2.0.0",
    "type": "get|post|put|delete",
    "url": "/secure_endpoint",
    "title": "",
    "description": "<p>Some endpoints require an extra level of security for authentication and authorization, the signed header:</p> <p><code>Authorization: api_token:api_signature</code></p> <p><code>api_signature</code> is built by concatenating a series of strings containing request information that will allow the API to authorize and authenticate the request. Refer to the tables below for data definition.</p> <p>To create the signature, the following steps are needed:</p> <ol> <li>Format the request parameters as a querystring with it's keys underscored: <code>&quot;key_1=value1&amp;key_2=value2...&amp;key_n=valuen&quot;</code>. This is the content string. If the request does not include parameters (such as with index calls), go to step 3.</li> <li>Calculate the MD5 hash of the content string.</li> <li>Create the canonical string: <code>http_verb</code> + <code>&quot;\\n&quot;</code> + <code>content_string_md5</code> + <code>&quot;\\n&quot;</code> + <code>content_type</code> + <code>&quot;\\n&quot;</code> + <code>request_uri</code> + <code>&quot;\\n&quot;</code> + timestamp + <code>&quot;\\n&quot;</code></li> <li>Create the signature string by generating the Base64 url-encoded HMAC-SHA1 of the canonical string, hence generating a different signature for every request. The system calculates the signature for the incoming request. If there's a match, the requester demonstrates that they have access to the secret key, and the request is processed by the authority and the identity of the developer to whom the secret key was issued.</li> </ol>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "content_string",
            "description": "<p>This is the content sent with the request, formatted as a querystring with underscored keys, or an empty string if no content is required by the request.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content_string_md5",
            "description": "<p>The resulting MD5 sum string for the content_string.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "'POST'",
              "'PUT'",
              "'GET'",
              "'DELETE'"
            ],
            "optional": false,
            "field": "http_verb",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content_type",
            "description": "<p>Most of the time, it will be <code>'application/json'</code>. Should match the corresponding header.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "request_uri",
            "description": "<p>Path of the request, ej: <code>/api/v2/subusers</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "timestamp",
            "description": "<p>Date string in any RFC 2616 format (<a href=\"http://www.ietf.org/rfc/rfc2616.txt\">http://www.ietf.org/rfc/rfc2616.txt</a>). Should match the <code>X-TIMESTAMP</code> header.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "signature",
            "description": "<p>HMAC-SHA1 of the generated string from the step above.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "PHP example",
        "content": "\n# Step 0: Set the credentials and timestamp to use in the signature and headers:\n$api_token = \"01ae872ba2ae47cc88952dcbe053ed0a\";\n$api_secret = \"a091892b17d64e659d0916dc1a2a649f\";\n$date = new DateTime;\n$timestamp = $date->format(DateTime::RFC822);\n# Step 1: Turn request JSON into a querystring sorted alphabetically by keys:\n$request_data = array(\n  'subuser' => array(\n    'email' => \"jane-01@example.com\",\n    'first_name' => \"Jane\",\n    'last_name' => \"Doe\",\n    'profile_uuid' =>  array('058ad5ec-a534-4ff7-a4a1-af83635a4566'),\n    'permissions' => array('client'),\n    'custom_permissions' => array('funnel', 'widgets', 'invites', 'support')\n  )\n);\n$content_string = http_build_query($request_data);\n# IMPORTANT: php querystring's construction adds array indexes to the querystring. Remove them in this step:\n$needles = array('/\\%5B\\d\\%5D/', '/\\%5B\\d\\d\\%5D/');\n$content_string = preg_replace($needles, '%5B%5D', $content_string);\n# Step 2: Calculate MD5 Hash for step 1 result:\n$content_string_md5 = hash('md5', utf8_encode($content_string));\n# Step 3: Create canonical string:\n$canonical_string = implode('\\n', array(\n  'POST', # http verb for RESTful #create actions\n  $content_string_md5, # md5 for the content string\n  'application/json', # content type, should be included as a header\n  '/api/v2/subusers', # endpoint path\n  $timestamp # timestamp for the request, should be included in the API-Request-Timestamp header\n));\n# Step 4: Create the signature using your api_secret:\n$signature = base64_encode(hash_hmac('sha256', $canonical_string, $api_secret, true));\n# Step 5: Execute a CURL request, for example:\n\n$ch = curl_init();\ncurl_setopt($ch, CURLOPT_HTTPHEADER, array(\n  'Content-Type: application/json',\n  'API-Request-Timestamp: '.$timestamp,\n  'Authorization: '.$api_token.':'.$signature\n));\ncurl_setopt($ch, CURLOPT_POST, 1);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($request_data));\ncurl_setopt($ch, CURLOPT_URL, 'https://api.quickreview.co/api/v2/subusers');\n$response = curl_exec($ch);\ncurl_close($ch);",
        "type": "php"
      },
      {
        "title": "Ruby example",
        "content": "\n# Step 1: Turn request JSON into a querystring:\ncontent_string = {\n  subuser: {\n    custom_permissions: %w[funnel widgets invites support],\n    email: \"jane@example.com\",\n    first_name: \"Jane\",\n    last_name: \"Doe\",\n    permissions: ['client'],\n    profile_uuid: [page.uuid]\n  }\n}.to_query\n\n# Step 2: Calculate MD5 Hash for step 1 result:\ncontent_string_md5 = Digest::MD5.hexdigest(content_string)\n\n# Step 3: Create canonical string:\ncanonical_string = [\n  'POST', # http verb for RESTful #create actions\n  content_string_md5, # md5 for the content string\n  'application/json', # content type, should be included as a header\n  '/api/v2/subusers', # endpoint path\n  Time.new.to_formatted_s(:rfc822) # timestamp for the request, should be included in the API-Request-Timestamp header\n].join('\\n')\n\n# Step 4: Create the signature using your api_secret:\nsignature = Base64.encode64(Openssl::HMAC.digest('sha256', api_secret, canonical_string))",
        "type": "ruby"
      }
    ],
    "filename": "app/controllers/api/v2/base_controller.rb",
    "groupTitle": "Authentication"
  },
  {
    "name": "API_Request_Signature",
    "group": "Authentication",
    "version": "2.0.0",
    "type": "get|post|put|delete",
    "url": "/secure_endpoint",
    "title": "",
    "description": "<p>Some endpoints require an extra level of security for authentication and authorization, the signed header:</p> <p><code>Authorization: api_token:api_signature</code></p> <p><code>api_signature</code> is built by concatenating a series of strings containing request information that will allow the API to authorize and authenticate the request. Refer to the tables below for data definition.</p> <p>To create the signature, the following steps are needed:</p> <ol> <li>Format the request parameters as a querystring with it's keys underscored: <code>&quot;key_1=value1&amp;key_2=value2...&amp;key_n=valuen&quot;</code>. This is the content string. If the request does not include parameters (such as with index calls), go to step 3.</li> <li>Calculate the MD5 hash of the content string.</li> <li>Create the canonical string: <code>http_verb</code> + <code>&quot;\\n&quot;</code> + <code>content_string_md5</code> + <code>&quot;\\n&quot;</code> + <code>content_type</code> + <code>&quot;\\n&quot;</code> + <code>request_uri</code> + <code>&quot;\\n&quot;</code> + timestamp + <code>&quot;\\n&quot;</code></li> <li>Create the signature string by generating the Base64 url-encoded HMAC-SHA1 of the canonical string, hence generating a different signature for every request. The system calculates the signature for the incoming request. If there's a match, the requester demonstrates that they have access to the secret key, and the request is processed by the authority and the identity of the developer to whom the secret key was issued.</li> </ol>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "content_string",
            "description": "<p>This is the content sent with the request, formatted as a querystring with underscored keys, or an empty string if no content is required by the request.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content_string_md5",
            "description": "<p>The resulting MD5 sum string for the content_string.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "'POST'",
              "'PUT'",
              "'GET'",
              "'DELETE'"
            ],
            "optional": false,
            "field": "http_verb",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content_type",
            "description": "<p>Most of the time, it will be <code>'application/json'</code>. Should match the corresponding header.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "request_uri",
            "description": "<p>Path of the request, ej: <code>/api/v2/subusers</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "timestamp",
            "description": "<p>Date string in any RFC 2616 format (<a href=\"http://www.ietf.org/rfc/rfc2616.txt\">http://www.ietf.org/rfc/rfc2616.txt</a>). Should match the <code>X-TIMESTAMP</code> header.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "signature",
            "description": "<p>HMAC-SHA1 of the generated string from the step above.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "PHP example",
        "content": "\n# Step 0: Set the credentials and timestamp to use in the signature and headers:\n$api_token = \"01ae872ba2ae47cc88952dcbe053ed0a\";\n$api_secret = \"a091892b17d64e659d0916dc1a2a649f\";\n$date = new DateTime;\n$timestamp = $date->format(DateTime::RFC822);\n# Step 1: Turn request JSON into a querystring sorted alphabetically by keys:\n$request_data = array(\n  'subuser' => array(\n    'email' => \"jane-01@example.com\",\n    'first_name' => \"Jane\",\n    'last_name' => \"Doe\",\n    'profile_uuid' =>  array('058ad5ec-a534-4ff7-a4a1-af83635a4566'),\n    'permissions' => array('client'),\n    'custom_permissions' => array('funnel', 'widgets', 'invites', 'support')\n  )\n);\n$content_string = http_build_query($request_data);\n# IMPORTANT: php querystring's construction adds array indexes to the querystring. Remove them in this step:\n$needles = array('/\\%5B\\d\\%5D/', '/\\%5B\\d\\d\\%5D/');\n$content_string = preg_replace($needles, '%5B%5D', $content_string);\n# Step 2: Calculate MD5 Hash for step 1 result:\n$content_string_md5 = hash('md5', utf8_encode($content_string));\n# Step 3: Create canonical string:\n$canonical_string = implode('\\n', array(\n  'POST', # http verb for RESTful #create actions\n  $content_string_md5, # md5 for the content string\n  'application/json', # content type, should be included as a header\n  '/api/v2/subusers', # endpoint path\n  $timestamp # timestamp for the request, should be included in the API-Request-Timestamp header\n));\n# Step 4: Create the signature using your api_secret:\n$signature = base64_encode(hash_hmac('sha256', $canonical_string, $api_secret, true));\n# Step 5: Execute a CURL request, for example:\n\n$ch = curl_init();\ncurl_setopt($ch, CURLOPT_HTTPHEADER, array(\n  'Content-Type: application/json',\n  'API-Request-Timestamp: '.$timestamp,\n  'Authorization: '.$api_token.':'.$signature\n));\ncurl_setopt($ch, CURLOPT_POST, 1);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($request_data));\ncurl_setopt($ch, CURLOPT_URL, 'https://api.quickreview.co/api/v2/subusers');\n$response = curl_exec($ch);\ncurl_close($ch);",
        "type": "php"
      },
      {
        "title": "Ruby example",
        "content": "\n# Step 1: Turn request JSON into a querystring:\ncontent_string = {\n  subuser: {\n    custom_permissions: %w[funnel widgets invites support],\n    email: \"jane@example.com\",\n    first_name: \"Jane\",\n    last_name: \"Doe\",\n    permissions: ['client'],\n    profile_uuid: [page.uuid]\n  }\n}.to_query\n\n# Step 2: Calculate MD5 Hash for step 1 result:\ncontent_string_md5 = Digest::MD5.hexdigest(content_string)\n\n# Step 3: Create canonical string:\ncanonical_string = [\n  'POST', # http verb for RESTful #create actions\n  content_string_md5, # md5 for the content string\n  'application/json', # content type, should be included as a header\n  '/api/v2/subusers', # endpoint path\n  Time.new.to_formatted_s(:rfc822) # timestamp for the request, should be included in the API-Request-Timestamp header\n].join('\\n')\n\n# Step 4: Create the signature using your api_secret:\nsignature = Base64.encode64(Openssl::HMAC.digest('sha256', api_secret, canonical_string))",
        "type": "ruby"
      }
    ],
    "filename": "app/controllers/api/v3/base_controller.rb",
    "groupTitle": "Authentication"
  },
  {
    "type": "get",
    "url": "/categories",
    "title": "",
    "name": "List",
    "group": "Config",
    "version": "3.0.0",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Category[]",
            "optional": false,
            "field": "category",
            "description": "<p>List of Categories Objects.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "{\n  \"categories\": [\n    ...,\n    {\"displayName\"=>\"Steel erector\", \"categoryId\"=>\"gcid:steel_erector\"},\n    {\"displayName\"=>\"Steel construction company\", \"categoryId\"=>\"gcid:steel_construction_company\"},\n    ...\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v3/reviewtrigger_config_controller.rb",
    "groupTitle": "Config"
  },
  {
    "type": "get",
    "url": "/profiles/:profile_id/customer_feedbacks",
    "title": "List",
    "name": "List",
    "group": "Customer_Feedbacks",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "CustomerFeedback[]",
            "optional": false,
            "field": "customer_feedbacks",
            "description": "<p>List of customer feedbacks.</p>"
          },
          {
            "group": "200",
            "type": "UUID",
            "optional": false,
            "field": "customer_feedback.id",
            "description": "<p>Customer feedback unique identifier.</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "customer_feedback.datetime",
            "description": "<p>Customer feedback submission date and time.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "customer_feedback.name",
            "description": "<p>Customer feedback author's full name.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "customer_feedback.email",
            "description": "<p>Customer feedback author's email address.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "customer_feedback.phone",
            "description": "<p>Customer feedback author's phone number.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "customer_feedback.message",
            "description": "<p>Customer feedback message.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "customer_feedback.ip_address",
            "description": "<p>Customer feedback submission ip address.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "customer_feedback.action_taken",
            "description": "<p>Action taken by customer prompting feedback submission.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "customer_feedback.response_status",
            "description": "<p>Status of any logged response.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "customer_feedback.response_notes",
            "description": "<p>Customer feedback notes.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful response",
          "content": "{\n  \"customer_feedbacks\": [\n      {\n          \"id\": \"a85823be-bef6-4b10-a89b-275fb40db9d6\",\n          \"date\": \"2017-08-25T15:48:07.647Z\",\n          \"name\": \"John Doe\",\n          \"email\": \"john@example.com\",\n          \"phone\": \"555-555-5555\",\n          \"message\": \"Sample customer feedback message\",\n          \"ip_addresss\": \"127.0.0.1\",\n          \"action_taken\": \"contact\",\n          \"response_status\": null,\n          \"response_notes\": null\n      },\n      {\n          \"id\": \"59a65bdc-3c54-4cae-bbcd-fe31e5192b76\",\n          \"date\": \"2017-08-18T17:05:56.464Z\",\n          \"name\": \"Jane Doe\",\n          \"email\": \"jane@example.com\",\n          \"phone\": \"222-222-2222\",\n          \"message\": \"Sample customer feedback message\",\n          \"ip_addresss\": \"127.0.0.1\",\n          \"prelude\": \"rating_1\",\n          \"response_status\": null,\n          \"response_notes\": null\n      }\n  ],\n  \"meta\": {\n      \"pagination\": {\n          \"current_page\": 1,\n          \"next_page\": null,\n          \"prev_page\": null,\n          \"total_pages\": 1,\n          \"total_count\": 2\n      },\n      \"customer_feedbacks_count\": 2\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/customer_feedbacks_controller.rb",
    "groupTitle": "Customer_Feedbacks"
  },
  {
    "type": "post",
    "url": "/profiles/:profile_id/links",
    "title": "Create",
    "name": "Create",
    "group": "Links",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": false,
            "field": "links",
            "description": "<p>Collection of recipients to add</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "link.url",
            "description": "<p>Url to monitor and to use as the landing page for the &quot;review us&quot; call to action.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "link.title",
            "description": "<p>Text to use for the link.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.opens_in_new_win",
            "description": "<p>When set to <code>true</code>, causes link to open in new window.</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "link.sort_order",
            "description": "<p>Number to decide the position to display the link.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.show",
            "description": "<p>Set to <code>true</code> will cause this link to be displayed in the profile page.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.skip_interstitial",
            "description": "<p>Set to <code>true</code> to skip interstitial modal.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "link.monitor_url",
            "description": "<p>Use <code>monitor_url</code> to provide a urel to pull reviews from, if it differs from <code>url</code>.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.show_on_desktop",
            "description": "<p>Set to <code>true</code> to display this link to desktop clients.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.show_on_mobile",
            "description": "<p>Set to <code>true</code> to display this link to mobile clients.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.share_content",
            "description": "<p>Set to <code>true</code> to display share content.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "link.share_title",
            "description": "<p>Category for the link.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "link.share_url",
            "description": "<p>Category for the link.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "link.custom_header",
            "description": "<p>Category for the link.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "link.custom_aside",
            "description": "<p>Category for the link.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.show_on_mobile_android",
            "description": "<p>Set to <code>true</code> to display this link to mobile android clients.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.show_on_mobile_blackberry",
            "description": "<p>Set to <code>true</code> to display this link to mobile blackberry clients.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.show_on_mobile_ios",
            "description": "<p>Set to <code>true</code> to display this link to mobile ios clients.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.show_on_mobile_opera",
            "description": "<p>Set to <code>true</code> to display this link to mobile opera clients.</p>"
          },
          {
            "group": "Parameter",
            "type": "Bool",
            "optional": true,
            "field": "link.show_on_mobile_windows",
            "description": "<p>Set to <code>true</code> to display this link to mobile windows clients.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Ruby example:",
        "content": "require 'net/http'\nrequire 'uri'\nrequire 'json'\n\ntoken = '26e2760dd0904d73845baf57e2571469'\nprofile_id = \"adab8d57-00b9-4ac2-88c7-ada8ab346cfa\"\n\nbody = {\n  links: [{\n    title: \"Google\",\n    url: \"https://www.google.com/banks/this-one-is-fake-1234\",\n    category: 'google',\n    switch_opens_in_new_win: true,\n    switch_skip_interstitial: false,\n    switch_show_on_desktop: true,\n    switch_show_on_mobile: false\n  }]\n}.to_json\n\nuri = URI(\"https://api.quickreview.co/api/v2/profiles/#{profile_id}/links\")\n\nhttp = Net::HTTP.new(uri.host, uri.port)\n\nrequest = Net::HTTP::Post.new(uri.request_uri)\nrequest['Content-Type'] = 'application/json'\nrequest['AUTHORIZATION'] = 'Token ' + token\n\nrequest.body = body\n\nhttp.request(request)",
        "type": "ruby"
      }
    ],
    "filename": "app/controllers/api/v2/links_controller.rb",
    "groupTitle": "Links"
  },
  {
    "type": "post",
    "url": "/profiles/:profile_id/links/:id",
    "title": "Delete",
    "name": "Delete",
    "group": "Links",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "id",
            "description": "<p>Link identifier.</p>"
          }
        ]
      }
    },
    "filename": "app/controllers/api/v2/links_controller.rb",
    "groupTitle": "Links"
  },
  {
    "type": "get",
    "url": "/profiles/:profile_id/links",
    "title": "List",
    "name": "List",
    "group": "Links",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Succesful response",
          "content": "{\n  \"links\": [\n    {\n      \"id\": \"aa600896-e98c-4bed-99e6-288244592ab3\",\n      \"profile_id\": \"9d9a7252-a437-4866-85dc-57a0d0d02057\",\n      \"title\": \"Effertz LLC\",\n      \"url\": \"http://von.name/marilie\",\n      \"category\": \"default\",\n      \"switch_opens_in_new_win\": true,\n      \"sort_order\": nil,\n      \"created_at\": \"2017-10-19T22:44:17.333Z\",\n      \"updated_at\": \"2017-10-19T22:44:17.333Z\",\n      \"switch_show\": true,\n      \"skip_interstitial\": false,\n      \"monitor_url\": nil,\n      \"show_on_desktop\": true,\n      \"show_on_mobile\": true,\n      \"share_content\": nil,\n      \"share_title\": nil,\n      \"share_url\": nil,\n      \"custom_header\": nil,\n      \"custom_aside\": nil,\n      \"show_on_mobile_android\": true,\n      \"show_on_mobile_blackberry\": true,\n      \"show_on_mobile_ios\": true,\n      \"show_on_mobile_opera\": true,\n      \"show_on_mobile_windows\": true\n    },\n    {\n      \"id\": \"f1f8a23f-dd63-4425-9a34-6b43b2c80719\",\n      \"profile_id\": \"9d9a7252-a437-4866-85dc-57a0d0d02057\",\n      \"title\": \"Bahringer-Windler\",\n      \"url\": \"http://jaskolskistiedemann.net/rick\",\n      \"category\": \"default\",\n      \"opens_in_new_win\": true,\n      \"sort_order\": nil,\n      \"created_at\": \"2017-10-19T22:44:17.339Z\",\n      \"updated_at\": \"2017-10-19T22:44:17.339Z\",\n      \"show\": true,\n      \"skip_interstitial\": false,\n      \"monitor_url\": nil,\n      \"show_on_desktop\": true,\n      \"show_on_mobile\": true,\n      \"share_content\": nil,\n      \"share_title\": nil,\n      \"share_url\": nil,\n      \"custom_header\": nil,\n      \"custom_aside\": nil,\n      \"show_on_mobile_android\": true,\n      \"show_on_mobile_blackberry\": true,\n      \"show_on_mobile_ios\": true,\n      \"show_on_mobile_opera\": true,\n      \"show_on_mobile_windows\": true\n    },\n    {\n      \"id\": \"05dc89c8-1612-41e9-b6ad-e8e3e3f9677a\",\n      \"profile_id\": \"9d9a7252-a437-4866-85dc-57a0d0d02057\",\n      \"title\": \"Becker-Mante\",\n      \"url\": \"http://block.name/dorian\",\n      \"category\": \"default\",\n      \"opens_in_new_win\": true,\n      \"sort_order\": nil,\n      \"created_at\": \"2017-10-19T22:44:17.343Z\",\n      \"updated_at\": \"2017-10-19T22:44:17.343Z\",\n      \"show\": true,\n      \"skip_interstitial\": false,\n      \"monitor_url\": nil,\n      \"show_on_desktop\": true,\n      \"show_on_mobile\": true,\n      \"share_content\": nil,\n      \"share_title\": nil,\n      \"share_url\": nil,\n      \"custom_header\": nil,\n      \"custom_aside\": nil,\n      \"show_on_mobile_android\": true,\n      \"show_on_mobile_blackberry\": true,\n      \"show_on_mobile_ios\": true,\n      \"show_on_mobile_opera\": true,\n      \"show_on_mobile_windows\": true\n    },\n    {\n      \"id\": \"211be282-1b39-448c-8671-a1cf584a5738\",\n      \"profile_id\": \"9d9a7252-a437-4866-85dc-57a0d0d02057\",\n      \"title\": \"Schimmel, Kautzer and Herman\",\n      \"url\": \"http://bahringer.name/andy\",\n      \"category\": \"default\",\n      \"opens_in_new_win\": true,\n      \"sort_order\": nil,\n      \"created_at\": \"2017-10-19T22:44:17.347Z\",\n      \"updated_at\": \"2017-10-19T22:44:17.347Z\",\n      \"show\": true,\n      \"skip_interstitial\": false,\n      \"monitor_url\": nil,\n      \"show_on_desktop\": true,\n      \"show_on_mobile\": true,\n      \"share_content\": nil,\n      \"share_title\": nil,\n      \"share_url\": nil,\n      \"custom_header\":  nil,\n      \"custom_aside\": nil,\n      \"show_on_mobile_android\": true,\n      \"show_on_mobile_blackberry\": true,\n      \"show_on_mobile_ios\": true,\n      \"show_on_mobile_opera\": true,\n      \"show_on_mobile_windows\": true\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/links_controller.rb",
    "groupTitle": "Links"
  },
  {
    "version": "1.1.0",
    "group": "Orgs_Import",
    "type": "post",
    "url": "/orgs",
    "title": "Create Import",
    "name": "Create",
    "description": "<p>This API endpoint imports 3rd party organizations, its user accounts, profiles and profile groups. Organization's data is submitted here all at once, instead of having individual pieces of data submitted separately. If correct data is submitted, data will be queued for processing, and ID of a job submitted will be returned in JSON response. You can use this ID to periodically check for your job status.</p> <p><strong>Authentication</strong></p> <p>This API is secured using simple HTTP Basic Auth schema. API client party will be provided with a simple username/password combo to use. Basic HTTP Auth is supported by all available HTTP clients. It can be provided even  as the part of URL itself, using following simple schema: http://username:password@api.quickreview.co/api/import/v1/orgs.....</p> <p>Please contact Review Trigger Import API admin in order to get username and password you should use for Import API</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Organization ID used on external system</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Organization name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "email",
            "description": "<p>Organization's master account email address</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": false,
            "field": "groups",
            "description": "<p>Array of groups to import and add to this org</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groups.name",
            "description": "<p>Group name</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "groups.parent_id",
            "description": "<p>Group's parent ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": false,
            "field": "profiles",
            "description": "<p>Array of profiles to import and add to this org</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "profiles.id",
            "description": "<p>Profile ID used on external system</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "profiles.name",
            "description": "<p>Profile name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "profiles.shortname",
            "description": "<p>Unique profile's name used in landing page URL. Only letters and dashes allowed(A-Z, 0-9 or hyphen)</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": false,
            "field": "profiles.urls",
            "description": "<p>URLs to monitor for this profile</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "profiles.group_id",
            "description": "<p>Group ID if it belongs to any group</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": true,
            "field": "profiles.reviews",
            "description": "<p>Array of reviews associated to this profile</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "profiles.reviews.title",
            "description": "<p>Review's title</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "profiles.reviews.content",
            "description": "<p>Review's content</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "profiles.reviews.attribution",
            "description": "<p>Review's author</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "profiles.reviews.rating",
            "description": "<p>Review's rating</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "profiles.reviews.date",
            "description": "<p>Review's date in YYYY-MM-DD format</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": false,
            "field": "users",
            "description": "<p>Array of users to import and assign to this org</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "users.id",
            "description": "<p>User's ID on external system</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "users.first_name",
            "description": "<p>User's first name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "users.last_name",
            "description": "<p>User's last name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "users.email",
            "description": "<p>User's email address</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "users.encrypted_password",
            "description": "<p>User's encrypted password, if Devise is used on 3rd party side. This enables all the login information to be migrated, and lets users login on Review Trigger using same credentials</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "users.password",
            "description": "<p>User's raw password. If provided encrypted_password will be overwritten by it</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer[]",
            "optional": true,
            "field": "users.permissions",
            "description": "<p>List of profile IDs this user has access to</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request example:",
          "content": "{\n  \"org\": {\n    \"name\": \"Tony Romas - Demo\",\n    \"groups\": [\n      {\"id\": 1234, \"name\": \"Group 1\"},\n      {\"id\": 5678, \"name\": \"Group 2\"}\n    ],\n    \"profiles\": [\n      {\n        \"id\": 1234,\n        \"name\": \"2581 S. Packerland Dr. - Green Bay, WI\",\n        \"urls\": [\n          \"https://www.google.com/maps/place/Tony+Roma's/@44.4919211,-88.1079896,17z/data=!4m5!1m2!2m1!1s0x8802f973f4dfcdbb:0xb70c78f8c13c495e?hl=en\",\n          \"https://www.facebook.com/TRGreenBay/\"\n        ],\n        \"group_id\": 1234\n     },\n      {\n        \"id\": 5678,\n        \"name\": \"98-150 Kaonohi St. - Aiea Pearlridge, HI\",\n        \"urls\": [\n          \"https://www.google.com/maps/place/Tony+Roma's/@21.3845663,-157.9474782,17z/data=!3m1!4b1!4m2!3m1!1s0x7c006f53685164eb:0x104d4c36922e95ce?hl=en\",\n          \"https://www.facebook.com/TRAiea\"\n        ],\n        \"group_id\": 5678\n      }\n    ],\n    \"users\": [\n      { \"email\": full_access_user_email, \"permissions\": [1234, 5678] },\n      { \"email\": restricted_access_user_email, \"encrypted_password\": \"asdf\", \"permissions\": [1234] }\n    ]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "ok",
            "description": "<p><code>true</code> if import was submitted successfully</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>In case import was submitted successfully this would be import's job ID. Use this ID to check import job status, and check when import is completed and finished</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"ok\": true,\n  \"id\": 1234567890,\n  \"message\": \"Org queued for import successfully.\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "ok",
            "description": "<p><code>false</code> if there was an error submitting Org's data for import</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Descriptive representation of import job failure</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"ok\": false,\n  \"message\": \"Required param `org` is missing\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/import/v1/orgs_controller.rb",
    "groupTitle": "Orgs_Import"
  },
  {
    "version": "1.1.0",
    "group": "Orgs_Import",
    "type": "get",
    "url": "/orgs/:job_id",
    "title": "Get Import",
    "name": "Get",
    "description": "<p>This API endpoint retrieves Import job information. Use Job ID acquired in POST action, to retrieve your job's status and information. Once import is successfully completed, you will be presented with success status message as well with an ID of newly created Org's master User account. ID present in JSON response is the signal Org is successfully imported, and this ID is actually ID of newly created master User account for this Org</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "id",
            "description": "<p>ID of a Job submitted for import via POST action. This param is provided as the URL param, or more precisely as the part of URL path itself, as the last URL segment</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": \"pending\"\n  ........\n}",
          "type": "json"
        },
        {
          "title": "Success response:",
          "content": "HTTP/1.1 200 OK\n{\n \"ok\": true,\n \"id\": 8901234567\n \"message\": \"Successfully imported organization.....\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"ok\": false,\n  \"message\": \"Duplicate data: Check if email address is already in use?\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/import/v1/orgs_controller.rb",
    "groupTitle": "Orgs_Import"
  },
  {
    "name": "API_Request_Signature",
    "group": "Pagination",
    "version": "2.0.0",
    "type": "get",
    "url": "/secure_endpoint",
    "title": "",
    "description": "<p>Sometimes, when calling our API, we have a lot of data to show you. In order to handle this massive amount of information efficiently, we allow our users to paginate through these results.</p> <p>For instance, sending a <code>GET</code> request to <code>https://api.quickreview.co/api/v2/profiles/:profile_id/customer_feedbacks</code> could return, in addition to the information you are expecting, a <code>meta</code> hash indicating all the information you need for paginating.</p> <p>To specify a different page to see more results, simply add the <code>page</code> parameter to your endpoint with the desired page number like so:</p> <p><code>https://api.quickreview.co/api/v2/profiles/:profile_id/customer_feedbacks?page=2</code></p> <p>This will give you all the customer feedbacks from the following page, plus the <code>meta</code> information corresponding to the current pagination state.</p>",
    "parameter": {
      "examples": [
        {
          "title": "Customer Feedback: Page 1",
          "content": "\"customer_feedbacks\": [\n  {...}\n],\n\"meta\": {\n  \"pagination\": {\n    \"current_page\": 1,\n    \"next_page\": 2,\n    \"prev_page\": null,\n    \"total_pages\": 106,\n    \"total_count\": 5260\n  },\n  \"customer_feedbacks_count\": 50\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Customer Feedback: Page 2",
          "content": "\"customer_feedbacks\": [\n   {...}\n],\n\"meta\": {\n  \"pagination\": {\n    \"current_page\": 2,\n    \"next_page\": 3,\n    \"prev_page\": 1,\n    \"total_pages\": 106,\n    \"total_count\": 5260\n  },\n  \"customer_feedbacks_count\": 50\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/base_controller.rb",
    "groupTitle": "Pagination"
  },
  {
    "name": "API_Request_Signature",
    "group": "Pagination",
    "version": "2.0.0",
    "type": "get",
    "url": "/secure_endpoint",
    "title": "",
    "description": "<p>Sometimes, when calling our API, we have a lot of data to show you. In order to handle this massive amount of information efficiently, we allow our users to paginate through these results.</p> <p>For instance, sending a <code>GET</code> request to <code>https://api.quickreview.co/api/v2/profiles/:profile_id/customer_feedbacks</code> could return, in addition to the information you are expecting, a <code>meta</code> hash indicating all the information you need for paginating.</p> <p>To specify a different page to see more results, simply add the <code>page</code> parameter to your endpoint with the desired page number like so:</p> <p><code>https://api.quickreview.co/api/v2/profiles/:profile_id/customer_feedbacks?page=2</code></p> <p>This will give you all the customer feedbacks from the following page, plus the <code>meta</code> information corresponding to the current pagination state.</p>",
    "parameter": {
      "examples": [
        {
          "title": "Customer Feedback: Page 1",
          "content": "\"customer_feedbacks\": [\n  {...}\n],\n\"meta\": {\n  \"pagination\": {\n    \"current_page\": 1,\n    \"next_page\": 2,\n    \"prev_page\": null,\n    \"total_pages\": 106,\n    \"total_count\": 5260\n  },\n  \"customer_feedbacks_count\": 50\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Customer Feedback: Page 2",
          "content": "\"customer_feedbacks\": [\n   {...}\n],\n\"meta\": {\n  \"pagination\": {\n    \"current_page\": 2,\n    \"next_page\": 3,\n    \"prev_page\": 1,\n    \"total_pages\": 106,\n    \"total_count\": 5260\n  },\n  \"customer_feedbacks_count\": 50\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v3/base_controller.rb",
    "groupTitle": "Pagination"
  },
  {
    "type": "post",
    "url": "/profiles",
    "title": "Create",
    "name": "Create",
    "description": "<p>This endpoint handles Profile creation. POST to this endpoint to create a Profile.</p>",
    "group": "Profiles",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name for the new profile.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "shortname",
            "description": "<p>Shortname for the new profile. It will be used as the url path for the profile.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "domain",
            "description": "<p>Use this parameter to set a custom domain for this profile.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Sample request",
          "content": "{\n  \"profile\":{\n    \"name\":\"The Title\",\n    \"shortname\":\"the title\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Succesful response",
          "content": "{\n  \"profile\": {\n    \"id\": \"570ac987-56d5-4222-8611-ff2c7c3f5294\",\n    \"name\": \"The Title\",\n    \"shortname\": \"the-title\",\n    \"domain\":\"\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Ruby example",
        "content": "require 'net/http'\nrequire 'uri'\nrequire 'json'\n\ntoken = '26e2760dd0904d73845baf57e2571469'\n\nuri = URI('http://api.quickreview.co/api/v2/profiles')\n\nhttp = Net::HTTP.new(uri.host, uri.port)\n\nrequest = Net::HTTP::Post.new(uri.request_uri)\n\nrequest['Content-Type'] = 'application/json'\nrequest['AUTHORIZATION'] = 'Token ' + token\n\nrequest.body = { profile: { name: 'The Title', shortname: 'the title' } }.to_json\n\nhttp.request(request)",
        "type": "ruby"
      }
    ],
    "filename": "app/controllers/api/v2/profiles_controller.rb",
    "groupTitle": "Profiles"
  },
  {
    "type": "get",
    "url": "/profiles",
    "title": "List",
    "name": "List",
    "group": "Profiles",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "optional": true,
            "field": "search",
            "description": "<p>Search text.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Profile[]",
            "optional": false,
            "field": "profiles",
            "description": "<p>List of profiles.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "profile.id",
            "description": "<p>Profile ID.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "profile.name",
            "description": "<p>Friendly name of the profile.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "profile.path",
            "description": "<p>The path or shortname of the profile.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "profile.domain",
            "description": "<p>The domain the profile lives under.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "profile.custom_field_1",
            "description": "<p>Custom or internal ID field.</p>"
          },
          {
            "group": "200",
            "type": "Text",
            "optional": false,
            "field": "profile.notes",
            "description": "<p>Custom notes.</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "profile.created_at",
            "description": "<p>Profile creation date.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "profile.reviews_list_url",
            "description": "<p>List of Google Reviews.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "profile.reviews_dialog_url",
            "description": "<p>Write a Google Review.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "profile.reviews_map_url",
            "description": "<p>Google Map Location.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "profile.reviews_alternate_url",
            "description": "<p>Alternate url for Google Reviews.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful response",
          "content": "{\n  \"profiles\": [\n    {\n      \"id\": \"113cf93a-eb26-41e9-b904-e2dcec2eb816\",\n      \"name\": \"Your Name\",\n      \"path\": \"yourname\",\n      \"domain\": \"\",\n      \"custom_field_1\": null,\n      \"notes\": null,\n      \"created_at\": \"2015-02-17T10:05:57.425-05:00\",\n      \"reviews_list_url\": \"https://www.google.com/search?q=zbc&ludocid=def#lrd=0x0:0xghi,1\",\n      \"reviews_alternate_url\": \"https://www.google.com/search?q=zbc&ludocid=def#lrd=0x0:0xghi,2,5\",\n      \"reviews_map_url\": \"https://maps.google.com/?cid=abc123\",\n      \"reviews_dialog_url\": \"http://search.google.com/local/writereview?placeid=abc456\"\n    },\n    {\n      \"id\": \"6e3d5b16-b5b6-4eca-91d8-a9837a88b289\",\n      \"name\": \"Some Other Name\",\n      \"path\": \"someother\",\n      \"domain\": \"\",\n      \"custom_field_1\": null,\n      \"notes\": null,\n      \"created_at\": \"2015-02-09T07:56:36.969-05:00\",\n      \"reviews_list_url\": \"https://www.google.com/search?q=zbc&ludocid=def#lrd=0x0:0xghi,1\",\n      \"reviews_alternate_url\": \"https://www.google.com/search?q=zbc&ludocid=def#lrd=0x0:0xghi,2,5\",\n      \"reviews_map_url\": \"https://maps.google.com/?cid=abc123\",\n      \"reviews_dialog_url\": \"http://search.google.com/local/writereview?placeid=abc456\"\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/profiles_controller.rb",
    "groupTitle": "Profiles"
  },
  {
    "type": "put",
    "url": "/profiles/:profile_id",
    "title": "",
    "name": "Update",
    "group": "Profiles",
    "description": "<p>This endpoint updates Profile attributes. Currently we only allow to update the suspended attribute.</p>",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "suspended",
            "description": "<p>Property name that handles the profile activation. Its value can only be true or false.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Sample request",
          "content": "{\n  \"profile\":{\n    \"suspended\": true\n  }\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Succesful response",
          "content": "{\n  \"message\": \"Your profile has been suspended.\"\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Ruby example",
        "content": "require 'net/http'\nrequire 'uri'\nrequire 'json'\n\ntoken = '26e2760dd0904d73845baf57e2571469'\n\nuri = URI('http://api.quickreview.co/api/v2/profiles/bb199e24-9e67-4ac7-a343-066305fa08e5/properties')\n\nhttp = Net::HTTP.new(uri.host, uri.port)\n\nrequest = Net::HTTP::Post.new(uri.request_uri)\n\nrequest['Content-Type'] = 'application/json'\nrequest['AUTHORIZATION'] = 'Token ' + token\n\nrequest.body = { profile: { suspended: true } }.to_json\n\nhttp.request(request)",
        "type": "ruby"
      }
    ],
    "filename": "app/controllers/api/v2/profiles_controller.rb",
    "groupTitle": "Profiles"
  },
  {
    "type": "get",
    "url": "/profiles/:profile_id/survey/questions/:question_id",
    "title": "Show",
    "name": "Show",
    "group": "Questions",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "question_id",
            "description": "<p>Question identifier.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Question uuid identifier.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "label",
            "description": "<p>Question label text.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "extra_text",
            "description": "<p>Question extra text.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "custom_field_1",
            "description": "<p>Question custom_field_1</p>"
          },
          {
            "group": "200",
            "type": "Boolean",
            "optional": false,
            "field": "active",
            "description": "<p>Question active status. If true, question will display in the survey.</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "sort_odrer",
            "description": "<p>Question sort_order. Will be used to sort questions to be displayed in the survey.</p>"
          },
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "options",
            "description": "<p>Questions options.</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "created_at",
            "description": "<p>Question creation date.</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "update_at",
            "description": "<p>Question last update date.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful response",
          "content": "{\n  \"question\":{\n    \"id\": \"e0fa25b8-4097-40c2-8cac-be72631f8372\",\n    \"label\":\"Question label 2\",\n    \"extra_text\":\"Question extra text 2\",\n    \"field_type\":\"text\",\n    \"custom_field_1\":null,\n    \"active\":true,\n    \"sort_order\":2,\n    \"options\":{\n      \"required\":true\n    },\n    \"created_at\":\"2017-09-01T10:05:00.000Z\",\n    \"updated_at\":\"2017-09-01T10:05:00.000Z\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/questions_controller.rb",
    "groupTitle": "Questions"
  },
  {
    "type": "put",
    "url": "/profiles/:profile_id/survey/questions/:question_id",
    "title": "Update",
    "name": "Update",
    "group": "Questions",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "question_id",
            "description": "<p>Question identifier uuid</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "5..256",
            "optional": false,
            "field": "label",
            "description": "<p>Question text.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "5..256",
            "optional": true,
            "field": "extra_text",
            "description": "<p>Tooltip text.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "allowedValues": [
              "\"text\"",
              "\"rating_scale\""
            ],
            "optional": false,
            "field": "field_type",
            "description": "<p>Type of question to create.</p>"
          },
          {
            "group": "Parameter",
            "type": "number",
            "size": "1-10000",
            "optional": false,
            "field": "sort_order",
            "description": "<p>Questions are displayed by this value in ascending order</p>"
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "allowedValues": [
              "false"
            ],
            "optional": false,
            "field": "active",
            "description": "<p>Wether to show or hide the question in the survey.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "..256",
            "optional": false,
            "field": "custom_field_1",
            "description": "<p>Can take any value. For client's internal use</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "options",
            "description": "<p>Set of options to customize question behavior.</p>"
          },
          {
            "group": "Parameter",
            "type": "FieldOptions",
            "optional": false,
            "field": "options.text",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "options.text.placeholder",
            "description": "<p>Defines content for the placeholder attribute for the text field.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "options.text.required",
            "description": "<p>Set to any string to mark the field as mandatory.</p>"
          },
          {
            "group": "Parameter",
            "type": "FieldOptions",
            "optional": false,
            "field": "options.rating_scale",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "number",
            "size": "1..10",
            "optional": false,
            "field": "options.rating_scale.best_rating",
            "description": "<p>Upper limit to the range of scoring options to display. Cannot be equal or lower than <code>worst_rating</code>.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "1..10",
            "optional": false,
            "field": "options.rating_scale.worst_rating",
            "description": "<p>Lower limit to the range of scoring options to display. Cannot be equal or greater than <code>best_rating</code>.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "options.rating_scale.best_label",
            "description": "<p>Text to display below the last (and highest) radio button label.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "options.rating_scale.worst_label",
            "description": "<p>Text to display below the last (and highest) radio button label.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "options.rating_scale.required",
            "description": "<p>Set to any string to mark the field as mandatory.</p>"
          }
        ]
      }
    },
    "filename": "app/controllers/api/v2/questions_controller.rb",
    "groupTitle": "Questions"
  },
  {
    "type": "get",
    "url": "/profiles/:profile_id/ratings",
    "title": "List Ratings",
    "name": "List",
    "group": "Ratings",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Profile's name.</p>"
          },
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "ratings",
            "description": "<p>List of ratings data.</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "rating.sites",
            "description": "<p>List of sites containing ratings data.</p>"
          },
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "rating.sites.category",
            "description": "<p>Name of the third-party site.</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "rating.sites.reviews_count",
            "description": "<p>Number of discovered reviews.</p>"
          },
          {
            "group": "200",
            "type": "Float",
            "optional": false,
            "field": "rating.sites.aggregate_rating",
            "description": "<p>Average rating.</p>"
          },
          {
            "group": "200",
            "type": "Integer[]",
            "optional": false,
            "field": "rating.sites.ratings",
            "description": "<p>List of all ratings.</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "rating.sites.most_recent_activity_date",
            "description": "<p>Date of the latest review found.</p>"
          },
          {
            "group": "200",
            "type": "Bool",
            "optional": false,
            "field": "rating.sites.is_listed",
            "description": "<p>Whether or not a listing was found on a site.</p>"
          },
          {
            "group": "200",
            "type": "Bool",
            "optional": false,
            "field": "rating.sites.is_claimed",
            "description": "<p>Whether or not a listing is identified as claimed by the owner (if relevant).</p>"
          },
          {
            "group": "200",
            "type": "Bool",
            "optional": false,
            "field": "rating.sites.is_verified",
            "description": "<p>Whether or not a listing is identified as &quot;verified&quot; (if relevant).</p>"
          },
          {
            "group": "200",
            "type": "Bool",
            "optional": false,
            "field": "rating.sites.is_closed",
            "description": "<p>Whether or not a listing identifies the business as &quot;closed&quot;.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "rating.sites.url",
            "description": "<p>Profile's listing URL the site.</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "rating.sites.checkins_count",
            "description": "<p>Number of checkins on the site listing (if relevant).</p>"
          },
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "rating.distributions",
            "description": "<p>Descriptive object with info of the distribution of listing's ratings.</p>"
          },
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "rating.distributions.sentiment",
            "description": "<p>Sentiment distribution.</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "rating.distributions.sentiment.positive",
            "description": "<p>Number of net positive reviews</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "rating.distributions.sentiment.neutral",
            "description": "<p>Number of net neutral reviews</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "rating.distributions.sentiment.negative",
            "description": "<p>Number of net negative reviews</p>"
          },
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "rating.distributions.stars",
            "description": "<p>Stars distribution</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "rating.distributions.stars.one",
            "description": "<p>Number of reviews with one star</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "rating.distributions.stars.two",
            "description": "<p>Number of reviews with two stars</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "rating.distributions.stars.three",
            "description": "<p>Number of reviews with three stars</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "rating.distributions.stars.four",
            "description": "<p>Number of reviews with four stars</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "rating.distributions.stars.five",
            "description": "<p>Number of reviews with five stars</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful response",
          "content": "{\n  \"name\": \"Benjamin Moore\",\n  \"ratings\": {\n    \"sites\": [\n      {\n        \"category\": \"facebook\",\n        \"reviews_count\": 18,\n        \"aggregate_rating\": 4.444444444444445,\n        \"ratings\": [\n          5,\n          5,\n          1,\n          5,\n          5,\n          5,\n          5,\n          1,\n          5,\n          5,\n          5,\n          5,\n          5,\n          3,\n          5,\n          5,\n          5,\n          5\n        ],\n        \"most_recent_activity_date\": \"2017-05-14\",\n        \"likes_count\": 317,\n        \"checkins_count\": 35,\n        \"is_listed\": true,\n        \"is_claimed\": true,\n        \"is_verified\": false,\n        \"is_closed\": false,\n        \"url\": \"http://www.facebook.com/314965189653\"\n      },\n      {\n        \"category\": \"google\",\n        \"reviews_count\": 15,\n        \"aggregate_rating\": 4.4,\n        \"ratings\": [\n          5,\n          5,\n          5,\n          4,\n          5,\n          5,\n          1,\n          4,\n          5,\n          4,\n          5,\n          4,\n          4,\n          5,\n          5\n        ],\n        \"most_recent_activity_date\": \"2017-07-21\",\n        \"likes_count\": null,\n        \"checkins_count\": null,\n        \"is_listed\": true,\n        \"is_claimed\": null,\n        \"is_verified\": null,\n        \"is_closed\": null,\n        \"url\": \"http://search.google.com/local/writereview?placeid=ChIJY1OW8025w4kROsc9Bfc5ZsY\"\n      }\n    ],\n    \"distributions\": {\n      \"sentiment\": {\n        \"positive\": 42,\n        \"neutral\": 4,\n        \"negative\": 6\n      },\n      \"stars\": {\n        \"one\": 5,\n        \"two\": 1,\n        \"three\": 4,\n        \"four\": 11,\n        \"five\": 31\n      }\n    }\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/ratings_controller.rb",
    "groupTitle": "Ratings"
  },
  {
    "type": "post",
    "url": "/profiles/:profile_id/recipients",
    "title": "Create",
    "name": "Create",
    "group": "Recipients",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": false,
            "field": "recipients",
            "description": "<p>Collection of recipients to add</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "recipient.first_name",
            "description": "<p>First Name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "recipient.last_name",
            "description": "<p>Last Name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "recipient.email_address",
            "description": "<p>Email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "recipient.phone_number",
            "description": "<p>Phone Number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "recipient.custom_field_1",
            "description": "<p>Custom or internal ID field</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "recipient.tags",
            "description": "<p>Tags</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example request:",
          "content": "{\n  \"recipients\":[\n    {\n      \"email_address\":\"john@example.com\",\n      \"phone_number\":\"973-508-9277\",\n      \"first_name\":\"John\",\n      \"last_name\":\"Doe\"\n    },\n    {\n      \"email_address\":\"new@example.com\",\n      \"first_name\":\"New\",\n      \"last_name\":\"Example\",\n      \"phone_number\":\"(712) 555-3232\"\n    },\n    {\n      \"email_address\":\"some_other@space.com \",\n      \"first_name\":\"Some\",\n      \"last_name\":\"Guy\",\n      \"phone_number\":\"\"\n    },\n    {\n      \"email_address\":\"third@example.com\",\n      \"first_name\":\"Third\",\n      \"last_name\":\"Example\",\n      \"phone_number\":\"\"\n    },\n    {\n      \"first_name\":\"Empty\",\n      \"last_name\":\"Attributes\",\n      \"email_address\":\"\",\n      \"phone_number\":\"\"\n    },\n    {\n      \"first_name\":\"No\",\n      \"last_name\":\"Email\",\n      \"phone_number\":\"9735089277\",\n      \"email_address\":\"\"\n    },\n    {\n      \"email_address\":\"john2@example.com\",\n      \"phone_number\":\"9735089277\",\n      \"first_name\":\"Different\",\n      \"last_name\":\"Email\"\n    },\n    {\n      \"email_address\":\"john@example.com\",\n      \"phone_number\":\"9735089278\",\n      \"first_name\":\"Different\",\n      \"last_name\":\"Phone\"\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Example response",
          "content": "{\n  \"recipients\":[\n    {\n      \"id\":\"2707a5f6-5047-11e7-b225-d481d722ed90\",\n      \"email_address\":\"john@example.com\",\n      \"phone_number\":\"+19735089277\",\n      \"first_name\":\"John\",\n      \"last_name\":\"Doe\",\n      \"sent_count\":0,\n      \"started_at\":\"2017-06-13T14:46:58.348Z\",\n      \"last_sent_at\":null,\n      \"is_pending\":false,\n      \"is_active\":true,\n      \"is_archived\":false,\n      \"rejected\":false,\n      \"blocked\":false,\n      \"bounced\":false,\n      \"clicked\":false,\n      \"flagged\":false,\n      \"opened\":false,\n      \"unsubscribed\":false,\n      \"custom_field_1\": null\n    },\n    {\n      \"id\":\"27343314-5047-11e7-b225-d481d722ed90\",\n      \"email_address\":\"new@example.com\",\n      \"phone_number\":\"+17125553232\",\n      \"first_name\":\"New\",\n      \"last_name\":\"Example\",\n      \"sent_count\":0,\n      \"started_at\":\"2017-06-13T10:46:58.349-04:00\",\n      \"last_sent_at\":null,\n      \"is_pending\":false,\n      \"is_active\":true,\n      \"is_archived\":false,\n      \"rejected\":false,\n      \"blocked\":false,\n      \"bounced\":false,\n      \"clicked\":false,\n      \"flagged\":false,\n      \"opened\":false,\n      \"unsubscribed\":false,\n      \"custom_field_1\": null\n    },\n    {\n      \"id\":\"27446720-5047-11e7-b225-d481d722ed90\",\n      \"email_address\":\"some_other@space.com\",\n      \"phone_number\":null,\n      \"first_name\":\"Some\",\n      \"last_name\":\"Guy\",\n      \"sent_count\":0,\n      \"started_at\":\"2017-06-13T10:46:58.351-04:00\",\n      \"last_sent_at\":null,\n      \"is_pending\":false,\n      \"is_active\":true,\n      \"is_archived\":false,\n      \"rejected\":false,\n      \"blocked\":false,\n      \"bounced\":false,\n      \"clicked\":false,\n      \"flagged\":false,\n      \"opened\":false,\n      \"unsubscribed\":false,\n      \"custom_field_1\": null\n    },\n    {\n      \"id\":\"27514bca-5047-11e7-b225-d481d722ed90\",\n      \"email_address\":\"third@example.com\",\n      \"phone_number\":null,\n      \"first_name\":\"Third\",\n      \"last_name\":\"Example\",\n      \"sent_count\":0,\n      \"started_at\":\"2017-06-13T10:46:58.351-04:00\",\n      \"last_sent_at\":null,\n      \"is_pending\":false,\n      \"is_active\":true,\n      \"is_archived\":false,\n      \"rejected\":false,\n      \"blocked\":false,\n      \"bounced\":false,\n      \"clicked\":false,\n      \"flagged\":false,\n      \"opened\":false,\n      \"unsubscribed\":false,\n      \"custom_field_1\": null\n    }\n  ],\n  \"meta\":{\n    \"errors\":[\n      \"Dropped duplicate contacts: 9735089277, john2@example.com/9735089277, john@example.com/9735089278\"\n    ],\n    \"notices\":[\n      \"john@example.com/(973) 508-9277 has been added/updated.\",\n      \"new@example.com/(712) 555-3232 has been added/updated.\",\n      \"some_other@space.com has been added/updated.\",\n      \"third@example.com has been added/updated.\"\n    ]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Ruby example",
        "content": "require 'net/http'\nrequire 'uri'\nrequire 'json'\n\ntoken = '26e2760dd0904d73845baf57e2571469'\nprofile_id = \"adab8d57-00b9-4ac2-88c7-ada8ab346cfa\"\nbody = {\n  \"recipients\" => [\n     {\n       \"email_address\" => \"john@example.com\", \"phone_number\" => '973-508-9277', \"first_name\" => \"John\",\n       \"last_name\" => \"Doe\"\n     },\n     {\n       \"email_address\" => \"new@example.com\", \"first_name\" => \"New\", \"last_name\" => \"Example\",\n       \"phone_number\" => \"(712) 555-3232\"\n     }\n   ]\n }.to_json\n\nuri = URI(\"https://api.quickreview.co/api/v2/profiles/#{profile_id}/recipients\")\nhttp = Net::HTTP.new(uri.host, uri.port)\n\nrequest = Net::HTTP::Post.new(uri.request_uri)\nrequest['Content-Type'] = 'application/json'\nrequest['AUTHORIZATION'] = 'Token ' + token\n\nrequest.body = body\n\nhttp.request(request)",
        "type": "ruby"
      }
    ],
    "filename": "app/controllers/api/v2/recipients_controller.rb",
    "groupTitle": "Recipients"
  },
  {
    "type": "get",
    "url": "/profiles/:profile_id/recipients",
    "title": "List",
    "name": "List",
    "group": "Recipients",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "term",
            "description": "<p>Search term to filter results with. The endpoint will try to match recipients by email or id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"only\"",
              "\"exclude\"",
              "\"all\""
            ],
            "optional": true,
            "field": "archived",
            "description": "<p>Decides how to filter archived recipients:</p> <ul> <li><code>only</code> returns archived recipients.</li> <li><code>exclude</code> returns unarchived recipients. This is the default behavior.</li> <li><code>all</code> includes both archived and unarchived.</li> </ul>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Succesful response",
          "content": "\n{\n  \"recipients\":[\n    {\n      \"id\":\"facd7a1a-4d58-11e7-b62a-2816ad682a27\",\n      \"email_address\":\"karelle@oberbrunner.com\",\n      \"phone_number\":null,\n      \"first_name\":\"Tag\",\n      \"last_name\":\"Taggerson\",\n      \"sent_count\":0,\n      \"started_at\":null,\n      \"last_sent_at\":null,\n      \"is_pending\":false,\n      \"is_active\":false,\n      \"is_archived\":false,\n      \"rejected\":false,\n      \"blocked\":false,\n      \"bounced\":false,\n      \"clicked\":false,\n      \"flagged\":false,\n      \"opened\":false,\n      \"unsubscribed\":false,\n      \"custom_field_1\": null\n    },\n    {\n      \"id\":\"fa9bd910-4d58-11e7-b62a-2816ad682a27\",\n      \"email_address\":\"marcus@mayert.io\",\n      \"phone_number\":null,\n      \"first_name\":\"Tag\",\n      \"last_name\":\"Taggerson\",\n      \"sent_count\":0,\n      \"started_at\":null,\n      \"last_sent_at\":null,\n      \"is_pending\":false,\n      \"is_active\":false,\n      \"is_archived\":false,\n      \"rejected\":false,\n      \"blocked\":false,\n      \"bounced\":false,\n      \"clicked\":false,\n      \"flagged\":false,\n      \"opened\":false,\n      \"unsubscribed\":false,\n      \"custom_field_1\": null\n    }\n  ],\n  \"meta\":\n  {\n    \"pagination\":\n    {\n      \"current_page\":1,\n      \"next_page\":null,\n      \"prev_page\":null,\n      \"total_pages\":1,\n      \"total_count\":2\n    },\n    \"recipients_count\":2\n  }\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Ruby example",
        "content": "require 'net/http'\nrequire 'uri'\nrequire 'json'\n\ntoken = '26e2760dd0904d73845baf57e2571469'\nprofile_id = \"adab8d57-00b9-4ac2-88c7-ada8ab346cfa\"\n\nuri = URI(\"https://api.quickreview.co/api/v2/profiles/#{profile_id}/recipients\")\nhttp = Net::HTTP.new(uri.host, uri.port)\n\nrequest = Net::HTTP::Get.new(uri.request_uri)\nrequest['Content-Type'] = 'application/json'\nrequest['AUTHORIZATION'] = 'Token ' + token\n\nrequest.body = body\n\nhttp.request(request)",
        "type": "ruby"
      }
    ],
    "filename": "app/controllers/api/v2/recipients_controller.rb",
    "groupTitle": "Recipients"
  },
  {
    "type": "get",
    "url": "/profiles/:profile_id/reviews",
    "title": "List",
    "name": "List",
    "group": "Reviews",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Review[]",
            "optional": false,
            "field": "reviews",
            "description": "<p>List of reviews.</p>"
          },
          {
            "group": "200",
            "type": "UUID",
            "optional": false,
            "field": "review.id",
            "description": "<p>Review unique identifier.</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "review.date",
            "description": "<p>Review's published date.</p>"
          },
          {
            "group": "200",
            "type": "Float",
            "optional": false,
            "field": "review.rating",
            "description": "<p>Rating given by reviewer.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "review.attribution_full",
            "description": "<p>Review author's full name.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "review.attribution_initial",
            "description": "<p>Review author's full first name and last initial.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "review.snippet",
            "description": "<p>Excerpt of review's content unless review was directly collected.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "review.category",
            "description": "<p>Review's category or source.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "review.url",
            "description": "<p>Review's public url.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "review.email_address",
            "description": "<p>Reviewer's email address.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "review.ip_address",
            "description": "<p>Reviewer's IP address.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "review.response_status",
            "description": "<p>Status of any logged response. (One of: nil, &quot;attention&quot;, &quot;responded&quot; or &quot;resolved&quot;)</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "review.response_notes",
            "description": "<p>Notes of any logged reponse.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "review.image_url",
            "description": "<p>URL of any available image of the review</p>"
          },
          {
            "group": "200",
            "type": "Boolean",
            "optional": false,
            "field": "review.streamed",
            "description": "<p>Whether or not the review is being streamed</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful response",
          "content": "{\n    \"reviews\": [\n        {\n            \"id\": \"e73f7d00-b36c-4c7b-acf2-1fce6aadec06\",\n            \"date\": \"2016-10-30\",\n            \"rating\": 5,\n            \"attribution_full\": \"Kailyn Murazik\",\n            \"attribution_initial\": \"Kailyn M.\",\n            \"snippet\": \"Microdosing raw denim park. Normcore authentic master skateboard post-ironic typewriter umami.\",\n            \"category\": null,\n            \"url\": null,\n            \"email_address\": null,\n            \"ip_address\": null,\n            \"response_status\": null,\n            \"image_url\": null,\n            \"streamed\": true\n        },\n        {\n            \"id\": \"b87848fb-5355-4715-9848-502bd1f41802\",\n            \"date\": \"2017-05-30\",\n            \"rating\": 5,\n            \"attribution_full\": \"Kailyn Murazik\",\n            \"attribution_initial\": \"Kailyn M.\",\n            \"snippet\": \"Microdosing raw denim park. Normcore authentic master skateboard post-ironic typewriter umami.\",\n            \"category\": null,\n            \"url\": null,\n            \"email_address\": null,\n            \"ip_address\": null,\n            \"response_status\": null,\n            \"image_url\": null,\n            \"streamed\": true\n        },\n        {\n            \"id\": \"89c71040-b1a8-464c-8df7-77e725fe347a\",\n            \"date\": \"2017-05-30\",\n            \"rating\": 4,\n            \"attribution_full\": \"Kailyn Murazik\",\n            \"attribution_initial\": \"Kailyn M.\",\n            \"snippet\": \"Microdosing raw denim park. Normcore authentic master skateboard post-ironic typewriter umami.\",\n            \"category\": null,\n            \"url\": null,\n            \"email_address\": null,\n            \"ip_address\": null,\n            \"response_status\": null,\n            \"image_url\": null,\n            \"streamed\": true\n        },\n        {\n            \"id\": \"9e58a2fd-2c36-4737-bca9-6420fc16b060\",\n            \"date\": \"2016-08-30\",\n            \"rating\": 3,\n            \"attribution_full\": \"Kailyn Murazik\",\n            \"attribution_initial\": \"Kailyn M.\",\n            \"snippet\": \"Microdosing raw denim park. Normcore authentic master skateboard post-ironic typewriter umami.\",\n            \"category\": null,\n            \"url\": null,\n            \"email_address\": null,\n            \"ip_address\": null,\n            \"response_status\": null,\n            \"image_url\": null,\n            \"streamed\": false\n        },\n        {\n            \"id\": \"9d386c1d-6281-42a7-a0bd-3b1ec0fedd19\",\n            \"date\": \"2016-07-30\",\n            \"rating\": 4,\n            \"attribution_full\": \"Kailyn Murazik\",\n            \"attribution_initial\": \"Kailyn M.\",\n            \"snippet\": \"Microdosing raw denim park. Normcore authentic master skateboard post-ironic typewriter umami.\",\n            \"category\": null,\n            \"url\": null,\n            \"email_address\": null,\n            \"ip_address\": null,\n            \"response_status\": null,\n            \"image_url\": null,\n            \"streamed\": true\n        },\n        {\n            \"id\": \"add7c128-3a39-4989-badc-4abb0e6e4bfd\",\n            \"date\": \"2017-04-30\",\n            \"rating\": 3,\n            \"attribution_full\": \"Kailyn Murazik\",\n            \"attribution_initial\": \"Kailyn M.\",\n            \"snippet\": \"Microdosing raw denim park. Normcore authentic master skateboard post-ironic typewriter umami.\",\n            \"category\": null,\n            \"url\": null,\n            \"email_address\": null,\n            \"ip_address\": null,\n            \"response_status\": null,\n            \"image_url\": null,\n            \"streamed\": false\n        },\n        {\n            \"id\": \"a56f8264-788a-4e68-9879-aac879409b3e\",\n            \"date\": \"2017-03-30\",\n            \"rating\": 2,\n            \"attribution_full\": \"Kailyn Murazik\",\n            \"attribution_initial\": \"Kailyn M.\",\n            \"snippet\": \"Microdosing raw denim park. Normcore authentic master skateboard post-ironic typewriter umami.\",\n            \"category\": null,\n            \"url\": null,\n            \"email_address\": null,\n            \"ip_address\": null,\n            \"response_status\": null,\n            \"image_url\": null,\n            \"streamed\": false\n        },\n        {\n            \"id\": \"727d5be7-3659-4976-a321-6c5e22bfc74e\",\n            \"date\": \"2016-11-30\",\n            \"rating\": 3,\n            \"attribution_full\": \"Kailyn Murazik\",\n            \"attribution_initial\": \"Kailyn M.\",\n            \"snippet\": \"Microdosing raw denim park. Normcore authentic master skateboard post-ironic typewriter umami.\",\n            \"category\": null,\n            \"url\": null,\n            \"email_address\": null,\n            \"ip_address\": null,\n            \"response_status\": null,\n            \"image_url\": null,\n            \"streamed\": false\n        },\n        {\n            \"id\": \"63d1484e-cd1c-4629-acc1-745263016513\",\n            \"date\": \"2017-05-30\",\n            \"rating\": 2,\n            \"attribution_full\": \"Kailyn Murazik\",\n            \"attribution_initial\": \"Kailyn M.\",\n            \"snippet\": \"Microdosing raw denim park. Normcore authentic master skateboard post-ironic typewriter umami.\",\n            \"category\": null,\n            \"url\": null,\n            \"email_address\": null,\n            \"ip_address\": null,\n            \"response_status\": null,\n            \"image_url\": null,\n            \"streamed\": false\n        },\n        {\n            \"id\": \"bc3396ea-bde9-4461-ad00-56ae77c4390b\",\n            \"date\": \"2017-03-30\",\n            \"rating\": 2,\n            \"attribution_full\": \"Kailyn Murazik\",\n            \"attribution_initial\": \"Kailyn M.\",\n            \"snippet\": \"Microdosing raw denim park. Normcore authentic master skateboard post-ironic typewriter umami.\",\n            \"category\": null,\n            \"url\": null,\n            \"email_address\": null,\n            \"ip_address\": null,\n            \"response_status\": null,\n            \"image_url\": null,\n            \"streamed\": false\n        }\n    ],\n    \"meta\": {\n        \"pagination\": {\n            \"current_page\": 1,\n            \"next_page\": null,\n            \"prev_page\": null,\n            \"total_pages\": 1,\n            \"total_count\": 11\n        },\n        \"reviews_count\": 11\n    }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/reviews_controller.rb",
    "groupTitle": "Reviews"
  },
  {
    "type": "post",
    "url": "/subusers",
    "title": "Create",
    "name": "Create",
    "description": "<p>This endpoint handles Subuser creation. POST to this endpoint to create a profile</p>",
    "group": "Subusers",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Subuser email address. This will be used as login information for the new subuser</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "profile_uuid",
            "description": "<p>Array of profile uuids that will be made accessible to the subuser</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "first_name",
            "description": "<p>Subuser first name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "last_name",
            "description": "<p>Subuser last name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "belongs_to_domain",
            "description": "<p>Domain to associate subuser under</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "allowedValues": [
              "\"admin\"",
              "\"staff\"",
              "\"client\""
            ],
            "optional": true,
            "field": "permissions",
            "description": "<p>Subuser type. Defaults to [&quot;client&quot;]:</p> <ul> <li><code>[&quot;admin&quot;]</code> allows access to all accounts and features</li> <li><code>[&quot;staff&quot;]</code> allows access to all except billing</li> <li><code>[&quot;client&quot;]</code> allows access to select accounts and profiles</li> </ul>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "allowedValues": [
              "\"funnel\"",
              "\"widgets\"",
              "\"invites\"",
              "\"reviews\"",
              "\"reports\"",
              "\"support\""
            ],
            "optional": true,
            "field": "custom_permissions",
            "description": "<p>Subuser custom permissions.  Defaults to [&quot;funnel&quot;, &quot;widgets&quot;, &quot;invites&quot;, &quot;reviews&quot;]:</p> <ul> <li><code>funnel</code> allows access to the profile Funnel tab: Review Funnel Editing</li> <li><code>widgets</code> allows access to profile Widgets tab: Widgets, Email Signature Snippets, Review Button</li> <li><code>invites</code> allows access to profile Invites tab: Email and SMS Campaigns, Invite and Opt-In Forms</li> <li><code>reviews</code> allows access to profile Reviews tab: Review monitoring and Review Stream</li> <li><code>reports</code> allows access to profile Reports tab: Analytics(beta) and Reports</li> <li><code>support</code> allows access to Review Trigger Support</li> </ul>"
          }
        ]
      },
      "examples": [
        {
          "title": "Sample request",
          "content": "{\n  \"subuser\": {\n    \"email\": \"john@example.com\",\n    \"first_name\": \"John\",\n    \"last_name\": \"Doe\",\n    \"belongs_to_domain\": \"api.quickreview.co\",\n    \"profiles\": [\n      \"6bbc3ba5-dc35-436b-9c14-5ee6182e8878\",\n      \"570ac987-56d5-4222-8611-ff2c7c3f5294\"\n    ],\n    \"permissions\": [\n      \"client\"\n    ],\n    \"custom_permissions\": [\n      \"funnel\",\n      \"widgets\",\n      \"invites\",\n      \"reviews\",\n      \"reports\",\n      \"support\"\n    ]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Successful Response",
          "content": "{\n  \"subuser\": {\n    \"email\": \"john@example.com\",\n    \"first_name\": \"John\",\n    \"last_name\": \"Doe\",\n    \"belongs_to_domain\": \"api.quickreview.co\",\n    \"permissions\": [\n      \"client\"\n    ],\n    \"custom_permissions\": [\n      \"funnel\",\n      \"widgets\",\n      \"invites\",\n      \"reviews\",\n      \"reports\",\n      \"support\"\n    ],\n    \"user_id\": \"294391a1-0a9e-4702-8743-6b3048b68167\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/subusers_controller.rb",
    "groupTitle": "Subusers"
  },
  {
    "type": "get",
    "url": "/subusers",
    "title": "List",
    "name": "List",
    "group": "Subusers",
    "version": "2.0.0",
    "success": {
      "examples": [
        {
          "title": "Successful Response",
          "content": "{\n  \"subusers\": [\n    {\n      \"email\": \"john@example.com\",\n      \"first_name\": \"John\",\n      \"last_name\": \"Doe\",\n      \"belongs_to_domain\": \"api.quickreview.co\",\n      \"permissions\": [\n        \"client\"\n      ],\n      \"custom_permissions\": [\n        \"funnel\",\n        \"widgets\",\n        \"invites\",\n        \"reviews\",\n        \"reports\",\n        \"support\"\n      ],\n      \"profiles\": [\n        \"6bbc3ba5-dc35-436b-9c14-5ee6182e8878\",\n        \"570ac987-56d5-4222-8611-ff2c7c3f5294\"\n      ],\n      \"user_id\": \"294391a1-0a9e-4702-8743-6b3048b68167\"\n    },\n    {\n      \"email\": \"jane@example.com\",\n      \"first_name\": \"Jane\",\n      \"last_name\": \"Doe\",\n      \"belongs_to_domain\": \"\",\n      \"permissions\": [\n        \"staff\"\n      ],\n      \"custom_permissions\": null,\n      \"profiles\": [\n        \"6bbc3ba5-dc35-436b-9c14-5ee6182e8878\",\n        \"570ac987-56d5-4222-8611-ff2c7c3f5294\",\n        \"c03f09c7-3bc0-4485-9c53-3cbe04b93713\",\n        \"ee40b566-b742-4fd3-98c1-fd37e2deea78\",\n        \"30c64043-4bb1-492c-a420-f4a9fa2db2e7\"\n      ],\n      \"user_id\": \"cabb546a-c5db-4ddd-bde3-540c400fb2f1\"\n    }\n  ],\n  \"meta\": {\n    \"pagination\": {\n      \"current_page\": 1,\n      \"next_page\": null,\n      \"previous_page\": null,\n      \"total_pages\": 1,\n      \"total_count\": 2\n    },\n    \"subusers_count\": 2\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/subusers_controller.rb",
    "groupTitle": "Subusers"
  },
  {
    "type": "put",
    "url": "/subusers/:user_id",
    "title": "Update",
    "name": "Update",
    "group": "Subusers",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "first_name",
            "description": "<p>First Name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "last_name",
            "description": "<p>Last Name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "belongs_to_domain",
            "description": "<p>Domain to associate subuser under</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "profile_uuid",
            "description": "<p>Array of profile uuids that will be made accessible to the subuser:</p> <ul> <li>Not needed if updating user to admin or staff</li> </ul>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "allowedValues": [
              "\"admin\"",
              "\"staff\"",
              "\"client\""
            ],
            "optional": true,
            "field": "permissions",
            "description": "<p>Subuser type. Defaults to [&quot;client&quot;]:</p> <ul> <li><code>[&quot;admin&quot;]</code> allows access to all accounts and features</li> <li><code>[&quot;staff&quot;]</code> allows access to all except billing</li> <li><code>[&quot;client&quot;]</code> allows access to select accounts and profiles</li> </ul>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "allowedValues": [
              "\"funnel\"",
              "\"widgets\"",
              "\"invites\"",
              "\"reviews\"",
              "\"reports\"",
              "\"support\""
            ],
            "optional": true,
            "field": "custom_permissions",
            "description": "<p>Subuser custom permissions.  Defaults to [&quot;funnel&quot;, &quot;widgets&quot;, &quot;invites&quot;, &quot;reviews&quot;]:</p> <ul> <li><code>funnel</code> allows access to the profile Funnel tab: Review Funnel Editing</li> <li><code>widgets</code> allows access to profile Widgets tab: Widgets, Email Signature Snippets, Review Button</li> <li><code>invites</code> allows access to profile Invites tab: Email and SMS Campaigns, Invite and Opt-In Forms</li> <li><code>reviews</code> allows access to profile Reviews tab: Review monitoring and Review Stream</li> <li><code>reports</code> allows access to profile Reports tab: Analytics(beta) and Reports</li> <li><code>support</code> allows access to Review Trigger Support</li> </ul>"
          }
        ]
      }
    },
    "filename": "app/controllers/api/v2/subusers_controller.rb",
    "groupTitle": "Subusers"
  },
  {
    "type": "get",
    "url": "/profiles/:profile_id/survey/responses",
    "title": "List",
    "name": "List",
    "group": "SurveyResponses",
    "version": "2.0.0",
    "description": "<p>This endpoint returns survey responses for the selected profile. Returns 15 responses per page.</p> <p>To request a specific page, request it's number in the <code>page</code> query parameter (defaults to first page).</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "optional": true,
            "field": "page",
            "description": "<p>Page number.</p>"
          },
          {
            "group": "Parameter",
            "optional": true,
            "field": "from",
            "description": "<p>Filters responses after this date at midnight UTC. Date format should be <code>YYYY-MM-DD</code>.</p>"
          },
          {
            "group": "Parameter",
            "optional": true,
            "field": "to",
            "description": "<p>Filters responses up to this date at 23:59:59. Date format should be <code>YYYY-MM-DD</code>.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "SurveyResponse[]",
            "optional": false,
            "field": "survey_responses",
            "description": "<p>List of responses received for the survey.</p>"
          },
          {
            "group": "200",
            "type": "UUID",
            "optional": false,
            "field": "survey_response.id",
            "description": "<p>Uuid identifier for the response.</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "survey_response.created_at",
            "description": "<p>DateTime for the creation of the response.</p>"
          },
          {
            "group": "200",
            "type": "Answer[]",
            "optional": false,
            "field": "survey_response.answers",
            "description": "<p>List of answers for questions in the survey.</p>"
          },
          {
            "group": "200",
            "type": "UUID",
            "optional": false,
            "field": "survey_response.answers.id",
            "description": "<p>Uuid identifier for the answer.</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "survey_response.answers.answer",
            "description": "<p>String value for the question's answer.</p>"
          },
          {
            "group": "200",
            "type": "Question",
            "optional": false,
            "field": "survey_response.answers.question",
            "description": "<p>Question that corresponds to the answer.</p>"
          },
          {
            "group": "200",
            "type": "UUID",
            "optional": false,
            "field": "survey_response.answers.question.id",
            "description": "<p>Uuid identifier for the answered question.</p>"
          },
          {
            "group": "200",
            "type": "UUID",
            "optional": false,
            "field": "survey_response.answers.question.custom_field_1",
            "description": "<p>Value stored in the question's custom_field_1 field</p>"
          },
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "meta",
            "description": ""
          },
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "meta.pagination",
            "description": "<p>Contains pagination data</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "meta.pagination.current_page",
            "description": "<p>Index for the current page</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "meta.pagination.next_page",
            "description": "<p>Index for the next page</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "meta.pagination.prev_page",
            "description": "<p>Index for the previous page</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "meta.pagination.total_pages",
            "description": "<p>Total page count</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "meta.survey_responses_count",
            "description": "<p>Total count of returned records</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful response",
          "content": "{\n  \"survey_responses\":[\n    {\n      \"id\":\"be1a06da-dae7-491f-b2bd-5acb63e5ffc1\",\n      \"created_at\":\"2017-04-27T20:29:30.363Z\",\n      \"answers\":[\n        {\n          \"id\":\"7f240e45-84f9-4ac8-8764-24a6a4c79f83\",\n          \"answer\":\"Burgundy\",\n          \"question\":{\"id\":\"3e24323e-1f44-44fa-994b-e7e8fbbf1379\"}\n        },\n        {\n          \"id\":\"01001fd8-e953-4628-98dd-c3272f4de1db\",\n          \"answer\":1,\n          \"question\":{\"id\":\"c561361e-829a-400e-978f-3a926e4fff9d\"}\n          },\n          {\n            \"id\":\"868818d3-18e9-43d8-9159-916b2b485848\",\n            \"answer\":\"Some long text could be an answer too.\",\n            \"question\":{\"id\":\"72b1d47f-cdd4-453c-9c68-87cabd6bde1e\", \"custom_field_1\":null}\n          }\n        ]\n      }\n    ]\n  }",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/survey_responses_controller.rb",
    "groupTitle": "SurveyResponses"
  },
  {
    "type": "post",
    "url": "/profiles/:profile_id/survey/copy",
    "title": "Copy",
    "name": "Copy",
    "description": "<p>Use this endpoint to copy a Profile's Survey to other profiles under the same API user ownership.</p>",
    "group": "Surveys",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "type": "UUID[]",
            "optional": false,
            "field": "profile_ids",
            "description": "<p>Target profile uuid identifiers to copy to, from profile_id.</p>"
          }
        ]
      }
    },
    "filename": "app/controllers/api/v2/surveys_controller.rb",
    "groupTitle": "Surveys"
  },
  {
    "type": "post",
    "url": "/profiles/:profile_id/survey",
    "title": "Create",
    "name": "Create",
    "description": "<p>This endpoint handles survey creation. POST to this endpoint to create a Profile's Survey. Questions parameters will be processed and added to the new Survey.</p>",
    "group": "Surveys",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "survey",
            "description": "<p>SurveyDetails.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "survey.segmenting_question",
            "description": "<p>Attributes for the question to use as segmenting question. Must be a <code>rating_scale</code> question.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "survey.questions",
            "description": "<p>List of questions to create with the survey.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "5..256",
            "optional": false,
            "field": "survey.questions.label",
            "description": "<p>Question text. The placeholder [[profile_name]] may be used to insert name associated with the profile.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "5..256",
            "optional": true,
            "field": "survey.questions.extra_text",
            "description": "<p>Tooltip text.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "allowedValues": [
              "\"text\"",
              "\"rating_scale\"",
              "\"radio\"",
              "\"email\""
            ],
            "optional": false,
            "field": "survey.questions.field_type",
            "description": "<p>Type of question to create.</p>"
          },
          {
            "group": "Parameter",
            "type": "number",
            "size": "1-10000",
            "optional": false,
            "field": "survey.questions.sort_order",
            "description": "<p>Questions are displayed by this value in ascending order</p>"
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "allowedValues": [
              "false"
            ],
            "optional": false,
            "field": "survey.questions.active",
            "description": "<p>Wether to show or hide the question in the survey.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "..256",
            "optional": false,
            "field": "survey.questions.custom_field_1",
            "description": "<p>Can take any value. For client's internal use</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "survey.questions.options",
            "description": "<p>Set of options to customize question behavior.</p>"
          },
          {
            "group": "Parameter",
            "type": "FieldOptions",
            "optional": false,
            "field": "survey.questions.options.text",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "survey.questions.options.text.placeholder",
            "description": "<p>Defines content for the placeholder attribute for the text field.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "survey.questions.options.text.required",
            "description": "<p>Set to any string to mark the field as mandatory.</p>"
          },
          {
            "group": "Parameter",
            "type": "FieldOptions",
            "optional": false,
            "field": "survey.questions.options.rating_scale",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "number",
            "size": "1..10",
            "optional": false,
            "field": "survey.questions.options.rating_scale.best_rating",
            "description": "<p>Upper limit to the range of scoring options to display. Cannot be equal or lower than <code>worst_rating</code>.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "1..10",
            "optional": false,
            "field": "survey.questions.options.rating_scale.worst_rating",
            "description": "<p>Lower limit to the range of scoring options to display. Cannot be equal or greater than <code>best_rating</code>.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "survey.questions.options.rating_scale.best_label",
            "description": "<p>Text to display below the last (and highest) radio button label.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "survey.questions.options.rating_scale.worst_label",
            "description": "<p>Text to display below the last (and highest) radio button label.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "survey.questions.options.rating_scale.required",
            "description": "<p>Set to any string to mark the field as mandatory.</p>"
          },
          {
            "group": "Parameter",
            "type": "FieldOptions",
            "optional": false,
            "field": "survey.questions.options.radio",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "survey.questions.options.radio.required",
            "description": "<p>Set to any string to mark the field as mandatory.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": false,
            "field": "survey.questions.options.radio.values",
            "description": "<p>Array of objects with the format { label: value } that will be used to populate inputs of radio type. You must provide at least two objects in this array.</p>"
          },
          {
            "group": "Parameter",
            "type": "FieldOptions",
            "optional": false,
            "field": "survey.questions.options.email",
            "description": "<p>And email field is a validated text field that will be hidden if the email of the survey respondent is known.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "survey.questions.options.email.placeholder",
            "description": "<p>Defines content for the placeholder attribute for the email field.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "survey.questions.options.email.required",
            "description": "<p>Set to any string to mark the field as mandatory.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Sample request",
          "content": "{\n  \"survey\":{\n    \"segmenting_question\":{\n      \"label\":\"How likely are you to recommend us to a friend?\",\n      \"field_type\":\"rating_scale\",\n      \"sort_order\":1,\n      \"options\":{\n        \"best_rating\":10,\n        \"worst_rating\":1,\n        \"best_label\":\"Very likely\",\n        \"worst_label\":\"Not likely\"\n      }\n    },\n    \"questions\":[\n      {\n        \"label\":\"First question\",\n        \"extra_text\":\"You cool?\",\n        \"field_type\":\"text\",\n        \"sort_order\":1\n      },\n      {\n        \"label\":\"Do you love cookies?\",\n        \"field_type\":\"radio\",\n        \"sort_order\":3,\n        \"options\":{\n          \"values\":[\n            {\"Yes\":1},\n            {\"No\":0}\n          ]\n        }\n      },\n      {\n        \"label\":\"Second question\",\n        \"extra_text\":\"You cool?\",\n        \"field_type\":\"rating_scale\",\n        \"sort_order\":3,\n        \"options\":{\n          \"best_rating\":10,\n          \"worst_rating\":1,\n          \"best_label\":\"Very likely\",\n          \"worst_label\":\"Not likely\"\n        }\n      }\n    ]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Validation failed response",
          "content": "{\n  \"survey\":{\n    \"questions\":[\n      {\n        \"id\":\"bae75525-0ee6-49eb-997a-3c65373ce300\",\n        \"label\":\"Nogo\",\n        \"errors\":{\n          \"label\":[\n            \"is too short (minimum is 5 characters)\"\n          ]\n        }\n      },\n      {\n        \"id\":\"bae75525-0ee6-49eb-997a-3c65373ce301\",\n        \"label\":\"Should not update\"\n      }\n    ]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/surveys_controller.rb",
    "groupTitle": "Surveys",
    "success": {
      "examples": [
        {
          "title": "Successful response",
          "content": "\n{\n  \"survey\": {\n    \"id\": \"a2078cc7-161d-4dd3-bf4b-f4cc5854084d\",\n    \"segmenting_question\": {\n      \"id\": \"889bcae9-bf76-4468-b405-96917204a301\",\n      \"label\": \"How likely are you to recommend us to a friend?\",\n      \"extra_text\": null,\n      \"field_type\": \"rating_scale\",\n      \"custom_field_1\": null,\n      \"active\": true,\n      \"sort_order\": 1,\n      \"options\": {\n        \"best_rating\": 10,\n        \"worst_rating\": 1,\n        \"best_label\": \"Very likely\",\n        \"worst_label\": \"Not likely\"\n      },\n      \"created_at\": \"2017-04-27T21:53:55.601Z\",\n      \"updated_at\": \"2017-04-27T21:59:54.865Z\"\n    },\n    \"questions\": [\n      {\n        \"id\": \"889bcae9-bf76-4468-b405-96917204a301\",\n        \"label\": \"How likely are you to recommend us to a friend?\",\n        \"extra_text\": null,\n        \"field_type\": \"rating_scale\",\n        \"custom_field_1\": null,\n        \"active\": true,\n        \"sort_order\": 1,\n        \"options\": {\n          \"best_rating\": 10,\n          \"worst_rating\": 1,\n          \"best_label\": \"Very likely\",\n          \"worst_label\": \"Not likely\"\n        },\n        \"created_at\": \"2017-04-27T21:53:55.601Z\",\n        \"updated_at\": \"2017-04-27T21:59:54.865Z\"\n      },\n      {\n        \"id\": \"f91fb3c7-e65f-4b63-9cb1-c749308353f8\",\n        \"label\": \"Second question\",\n        \"extra_text\": \"You cool?\",\n        \"field_type\": \"rating_scale\",\n        \"custom_field_1\": null,\n        \"active\": true,\n        \"sort_order\": 3,\n        \"options\": {\n          \"best_rating\": 10,\n          \"worst_rating\": 1,\n          \"best_label\": \"Very likely\",\n          \"worst_label\": \"Not likely\"\n        },\n        \"created_at\": \"2017-04-27T21:53:55.614Z\",\n        \"updated_at\": \"2017-04-27T21:59:54.871Z\"\n      },\n      {\n        \"id\": \"8089ac66-fccd-43c4-b379-b4b49405ffdc\",\n        \"label\": \"First question\",\n        \"extra_text\": \"You cool?\",\n        \"field_type\": \"text\",\n        \"custom_field_1\": null,\n        \"active\": true,\n        \"sort_order\": 5,\n        \"options\": {},\n        \"created_at\": \"2017-04-27T21:53:55.612Z\",\n        \"updated_at\": \"2017-04-27T22:00:36.969Z\"\n      }\n    ],\n    \"created_at\": \"2017-04-27T21:43:38.518Z\",\n    \"updated_at\": \"2017-04-27T21:53:55.607Z\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/profiles/:profile_id/survey",
    "title": "Show",
    "name": "Show",
    "group": "Surveys",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Survey uuid identifier.</p>"
          },
          {
            "group": "200",
            "type": "Question",
            "optional": false,
            "field": "segmenting_question",
            "description": "<p>Survey segmenting question details (if set)</p>"
          },
          {
            "group": "200",
            "type": "Question[]",
            "optional": false,
            "field": "questions",
            "description": "<p>list of questions</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful response",
          "content": "\n{\n  \"survey\": {\n    \"id\": \"a2078cc7-161d-4dd3-bf4b-f4cc5854084d\",\n    \"segmenting_question\": {\n      \"id\": \"889bcae9-bf76-4468-b405-96917204a301\",\n      \"label\": \"How likely are you to recommend us to a friend?\",\n      \"extra_text\": null,\n      \"field_type\": \"rating_scale\",\n      \"custom_field_1\": null,\n      \"active\": true,\n      \"sort_order\": 1,\n      \"options\": {\n        \"best_rating\": 10,\n        \"worst_rating\": 1,\n        \"best_label\": \"Very likely\",\n        \"worst_label\": \"Not likely\"\n      },\n      \"created_at\": \"2017-04-27T21:53:55.601Z\",\n      \"updated_at\": \"2017-04-27T21:59:54.865Z\"\n    },\n    \"questions\": [\n      {\n        \"id\": \"889bcae9-bf76-4468-b405-96917204a301\",\n        \"label\": \"How likely are you to recommend us to a friend?\",\n        \"extra_text\": null,\n        \"field_type\": \"rating_scale\",\n        \"custom_field_1\": null,\n        \"active\": true,\n        \"sort_order\": 1,\n        \"options\": {\n          \"best_rating\": 10,\n          \"worst_rating\": 1,\n          \"best_label\": \"Very likely\",\n          \"worst_label\": \"Not likely\"\n        },\n        \"created_at\": \"2017-04-27T21:53:55.601Z\",\n        \"updated_at\": \"2017-04-27T21:59:54.865Z\"\n      },\n      {\n        \"id\": \"f91fb3c7-e65f-4b63-9cb1-c749308353f8\",\n        \"label\": \"Second question\",\n        \"extra_text\": \"You cool?\",\n        \"field_type\": \"rating_scale\",\n        \"custom_field_1\": null,\n        \"active\": true,\n        \"sort_order\": 3,\n        \"options\": {\n          \"best_rating\": 10,\n          \"worst_rating\": 1,\n          \"best_label\": \"Very likely\",\n          \"worst_label\": \"Not likely\"\n        },\n        \"created_at\": \"2017-04-27T21:53:55.614Z\",\n        \"updated_at\": \"2017-04-27T21:59:54.871Z\"\n      },\n      {\n        \"id\": \"8089ac66-fccd-43c4-b379-b4b49405ffdc\",\n        \"label\": \"First question\",\n        \"extra_text\": \"You cool?\",\n        \"field_type\": \"text\",\n        \"custom_field_1\": null,\n        \"active\": true,\n        \"sort_order\": 5,\n        \"options\": {},\n        \"created_at\": \"2017-04-27T21:53:55.612Z\",\n        \"updated_at\": \"2017-04-27T22:00:36.969Z\"\n      }\n    ],\n    \"created_at\": \"2017-04-27T21:43:38.518Z\",\n    \"updated_at\": \"2017-04-27T21:53:55.607Z\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "app/controllers/api/v2/surveys_controller.rb",
    "groupTitle": "Surveys",
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AuthenticationFailed",
            "description": "<p>The authentication token is incorrect or mising.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response",
          "content": "{\n  \"id\":\"authentication_failed\",\n  \"message\":\"Authentication failed. Please check your API token.\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "put",
    "url": "/profiles/:profile_id/survey",
    "title": "Update",
    "name": "Update",
    "group": "Surveys",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "profile_id",
            "description": "<p>Profile identifier.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "survey",
            "description": "<p>SurveyDetails.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "survey.segmenting_question",
            "description": "<p>Attributes for the question to use as segmenting question. Must be a <code>rating_scale</code> question. You must provide the id field as well.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": false,
            "field": "survey.questions",
            "description": "<p>List of questions to create with the survey.</p>"
          },
          {
            "group": "Parameter",
            "type": "UUID",
            "optional": false,
            "field": "survey.questions.id",
            "description": "<p>Question identifier uuid</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "5..256",
            "optional": false,
            "field": "survey.questions.label",
            "description": "<p>Question text.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "5..256",
            "optional": true,
            "field": "survey.questions.extra_text",
            "description": "<p>Tooltip text.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "allowedValues": [
              "\"text\"",
              "\"rating_scale\""
            ],
            "optional": false,
            "field": "survey.questions.field_type",
            "description": "<p>Type of question to create.</p>"
          },
          {
            "group": "Parameter",
            "type": "number",
            "size": "1-10000",
            "optional": false,
            "field": "survey.questions.sort_order",
            "description": "<p>Questions are displayed by this value in ascending order</p>"
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "allowedValues": [
              "false"
            ],
            "optional": false,
            "field": "survey.questions.active",
            "description": "<p>Wether to show or hide the question in the survey.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "..256",
            "optional": false,
            "field": "survey.questions.custom_field_1",
            "description": "<p>Can take any value. For client's internal use</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "survey.questions.options",
            "description": "<p>Set of options to customize question behavior.</p>"
          },
          {
            "group": "Parameter",
            "type": "FieldOptions",
            "optional": false,
            "field": "survey.questions.options.text",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "survey.questions.options.text.placeholder",
            "description": "<p>Defines content for the placeholder attribute for the text field.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "survey.questions.options.text.required",
            "description": "<p>Set to any string to mark the field as mandatory.</p>"
          },
          {
            "group": "Parameter",
            "type": "FieldOptions",
            "optional": false,
            "field": "survey.questions.options.rating_scale",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "number",
            "size": "1..10",
            "optional": false,
            "field": "survey.questions.options.rating_scale.best_rating",
            "description": "<p>Upper limit to the range of scoring options to display. Cannot be equal or lower than <code>worst_rating</code>.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "1..10",
            "optional": false,
            "field": "survey.questions.options.rating_scale.worst_rating",
            "description": "<p>Lower limit to the range of scoring options to display. Cannot be equal or greater than <code>best_rating</code>.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "survey.questions.options.rating_scale.best_label",
            "description": "<p>Text to display below the last (and highest) radio button label.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "survey.questions.options.rating_scale.worst_label",
            "description": "<p>Text to display below the last (and highest) radio button label.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "survey.questions.options.rating_scale.required",
            "description": "<p>Set to any string to mark the field as mandatory.</p>"
          }
        ]
      }
    },
    "filename": "app/controllers/api/v2/surveys_controller.rb",
    "groupTitle": "Surveys"
  }
] });
