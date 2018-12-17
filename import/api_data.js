define({ "api": [
  {
    "type": "post",
    "url": "/orgs",
    "title": "Create",
    "name": "Create",
    "group": "Orgs",
    "description": "<p>This API endpoint imports 3rd party organizations and its user accounts</p>",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Oraganization name</p>"
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
            "description": "<p>User's encrypted password, if Devise is used on 3rd party side. This enables all the loging information to be migrated, and lets users login on grade.us using same credentials</p>"
          }
        ]
      }
    },
    "filename": "app/controllers/api/import/v1/orgs_controller.rb",
    "groupTitle": "Orgs"
  }
] });