define({ "api": [
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
  }
] });
