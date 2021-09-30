import json
import yaml
import pymysql
import boto3
import string
import random
import time
import requests
import redis

def watcher_getL2Transactions(event, context):

  # Parse incoming event
  body = json.loads(event["body"])
  address = body.get("address")
  fromRange = int(body.get("fromRange"))
  toRange = int(body.get("toRange"))

  # Read YML
  with open("env.yml", 'r') as ymlfile:
    config = yaml.load(ymlfile, Loader=yaml.FullLoader)

  # Get MySQL host and port
  endpoint = config.get('RDS_ENDPOINT')
  user = config.get('RDS_MYSQL_NAME')
  dbpassword = config.get('RDS_MYSQL_PASSWORD')
  dbname = config.get('RDS_DBNAME')

  con = pymysql.connect(host=endpoint, user=user, db=dbname,
                        passwd=dbpassword, connect_timeout=5)

  transactionData = []
  with con.cursor() as cur:
    try:
      # Order
      # 0              1                     2                   3
      # stateRootHash, stateRootBlockNumber, stateRootBlockHash, stateRootBlockTimestamp,
      # 4             5                     6       7    8          9                   10                          11         12      13             14           15      16
      # receipt.hash, receipt.blockNumber, `from`, `to`, timestamp, crossDomainMessage, crossDomainMessageFinalize, fastRelay, l1Hash, l1BlockNumber, l1BlockHash, l1From, l1To
      # 17          18      19         20          21          22            23
      # exitSender, exitTo, exitToken, exitAmount, exitReceive, exitFeeRate, status
      cur.execute("""SELECT
        stateRootHash, stateRootBlockNumber, stateRootBlockHash, stateRootBlockTimestamp,
        receipt.hash, receipt.blockNumber, `from`, `to`, timestamp, crossDomainMessage, crossDomainMessageFinalize, receipt.fastRelay, l1Hash, l1BlockNumber, l1BlockHash, l1From, l1To,
        exitSender, exitTo, exitToken, exitAmount, exitReceive, exitFeeRate, exitL2.status
        FROM receipt
        LEFT JOIN stateRoot
        on receipt.blockNumber = stateRoot.blockNumber
        LEFT JOIN exitL2
        ON receipt.blockNumber = exitL2.blockNumber
        WHERE `from`=%s ORDER BY CAST(receipt.blockNumber as unsigned) DESC LIMIT %s OFFSET %s""", (address, toRange - fromRange, fromRange))
      transactionsDataRaw = cur.fetchall()
      print(transactionsDataRaw)
      for transactionDataRaw in transactionsDataRaw:
        # No cross domain message
        if transactionDataRaw[9] == False:
          crossDomainMessageSendTime, crossDomainMessageEstimateFinalizedTime, fastRelay = None, None, None
        else:
          # Has cross domain message
          # crossDomainMessageSendTime is stateRootBlockTimestamp
          if transactionDataRaw[3] != None:
            crossDomainMessageSendTime = transactionDataRaw[3]
          else:
            crossDomainMessageSendTime = transactionDataRaw[8]
          fastRelay = transactionDataRaw[11]
          if fastRelay == True:
            # Estimate time
            crossDomainMessageEstimateFinalizedTime = int(crossDomainMessageSendTime) + int(config.get('ESTIMATE_FINIALIZED_TIME'))
          else:
            # Estimate time is 7 days
            crossDomainMessageEstimateFinalizedTime = int(crossDomainMessageSendTime) + 60 * 60 * 24 * 7
        # exitL2
        if transactionDataRaw[17] != None: exitL2 = True
        else: exitL2 = False

        transactionData.append({
          "hash": transactionDataRaw[4],
          "blockNumber": int(transactionDataRaw[5]),
          "from": transactionDataRaw[6],
          "to": transactionDataRaw[7],
          "timeStamp": transactionDataRaw[8],
          "exitL2": exitL2,
          "crossDomainMessage": {
            "crossDomainMessage": transactionDataRaw[9],
            "crossDomainMessageFinalize": transactionDataRaw[10],
            "crossDomainMessageSendTime": crossDomainMessageSendTime,
            "crossDomainMessageEstimateFinalizedTime": crossDomainMessageEstimateFinalizedTime,
            "fast": fastRelay,
            "l1Hash": transactionDataRaw[12],
            "l1BlockNumber": transactionDataRaw[13],
            "l1BlockHash": transactionDataRaw[14],
            "l1From": transactionDataRaw[15],
            "l1To": transactionDataRaw[16]
          },
          "stateRoot": {
            "stateRootHash": transactionDataRaw[0],
            "stateRootBlockNumber": transactionDataRaw[1],
            "stateRootBlockHash": transactionDataRaw[2],
            "stateRootBlockTimeStamp": transactionDataRaw[3]
          },
          "action": {
            "sender": transactionDataRaw[17],
            "to": transactionDataRaw[18],
            "token": transactionDataRaw[19],
            "amount": transactionDataRaw[20],
            "receive": transactionDataRaw[21],
            "feeRate": transactionDataRaw[22],
            "fast": fastRelay,
            "status": transactionDataRaw[23]
          }
        })

    except Exception as e:
      print(e)
      transactionData = []

  con.close()

  response = {
    "statusCode": 201,
    "headers": {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": True,
      "Strict-Transport-Security": "max-age=63072000; includeSubdomains; preload",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "same-origin",
      "Permissions-Policy": "*",
    },
    "body": json.dumps(transactionData),
  }
  return response
