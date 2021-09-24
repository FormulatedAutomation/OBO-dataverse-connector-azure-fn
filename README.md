# Dataverse OBO Backend

The goal of this project to to build a custom connector for PowerApps to query Dataverse via an Azure Function we control.

This lets us write queries for Dataverse that would be far more complicated than the ones allow inside PowerApps and avoid the issue of "delegation" and the dreaded 500(2000 max) record limit.

## Demo Video

## How it works

- We publish the code below to an Azure Function
- PowerApps adds this function as a custom connector.
- The custom connector authenticates with this function using and "On Behalf Of" token.
- The OBO Token is used by this Azure Function to make a query to the Dataverse Web

## Azure Setup

**Coming soon**

We're still working on a setup guide, in the meantime feel free to reach out if you have questions about getting it setup.

mark@formulatedautomation.com

## MIT Licensed

Free to use, free to modify for your own uses