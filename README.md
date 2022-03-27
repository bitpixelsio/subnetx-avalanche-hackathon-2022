# SubnetX (Avalanche Hackhaton 2022)

SubnetX is a tool for ledger compatible subnet creation and management. It does two main work as following:

* Ledger compatible subnet creation: It enables users to create a subnet in 3 steps. First, a user creates a subnet with their control keys. After the subnet is created, users can add validators and finally create blockchains on it.   

  We have built a dashboard where users can see all of their subnets and the details such as the number of validators and the number of blockchains in a subnet.

* Notification setup for expiring validators: Users can set up a notification for a subnet for expiring validators. Users can get a notification via a webhook one day before a validator expires. They will be able to get slack or discord notifications about the expiration by this webhook.

To sum up, SubnetX is a simple dashboard where users can create subnets and set up notifications for expiring validators.
