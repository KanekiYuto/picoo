export const creemProducts = {
  "creditPacks": [
    {
      "id": "credits_1000_30d",
      "name": "mini",
      "price": 10,
      "credits": 1000,
      "validDays": 30,
      "ids": {
        "current": "",
        "historical": []
      }
    },
    {
      "id": "credits_5000_30d",
      "name": "standard",
      "price": 50,
      "credits": 5000,
      "validDays": 30,
      "ids": {
        "current": "",
        "historical": []
      }
    },
    {
      "id": "credits_20000_30d",
      "name": "pro",
      "price": 200,
      "credits": 20000,
      "validDays": 30,
      "ids": {
        "current": "",
        "historical": []
      }
    },
    {
      "id": "credits_1000_365d",
      "name": "mini",
      "price": 10,
      "credits": 1000,
      "validDays": 365,
      "ids": {
        "current": "",
        "historical": []
      }
    },
    {
      "id": "credits_5000_365d",
      "name": "standard",
      "price": 50,
      "credits": 5000,
      "validDays": 365,
      "ids": {
        "current": "",
        "historical": []
      }
    },
    {
      "id": "credits_20000_365d",
      "name": "pro",
      "price": 200,
      "credits": 20000,
      "validDays": 365,
      "ids": {
        "current": "",
        "historical": []
      }
    }
  ],
  "subscriptions": {
    "monthly_basic": {
      "planType": "basic",
      "billingCycle": "monthly",
      "price": 10,
      "credits": 1500,
      "periodMonths": 1,
      "concurrency": {
        "image": 8,
        "video": 2
      },
      "ids": {
        "current": "",
        "historical": []
      }
    },
    "yearly_basic": {
      "planType": "basic",
      "billingCycle": "yearly",
      "price": 96,
      "credits": 21600,
      "periodMonths": 12,
      "concurrency": {
        "image": 8,
        "video": 2
      },
      "ids": {
        "current": "",
        "historical": []
      }
    },
    "monthly_plus": {
      "planType": "plus",
      "billingCycle": "monthly",
      "price": 20,
      "credits": 4500,
      "periodMonths": 1,
      "concurrency": {
        "image": 12,
        "video": 4
      },
      "ids": {
        "current": "",
        "historical": []
      }
    },
    "yearly_plus": {
      "planType": "plus",
      "billingCycle": "yearly",
      "price": 192,
      "credits": 64800,
      "periodMonths": 12,
      "concurrency": {
        "image": 12,
        "video": 4
      },
      "ids": {
        "current": "",
        "historical": []
      }
    },
    "monthly_pro": {
      "planType": "pro",
      "billingCycle": "monthly",
      "price": 100,
      "credits": 20000,
      "periodMonths": 1,
      "concurrency": {
        "image": 60,
        "video": 20
      },
      "ids": {
        "current": "",
        "historical": []
      }
    },
    "yearly_pro": {
      "planType": "pro",
      "billingCycle": "yearly",
      "price": 960,
      "credits": 288000,
      "periodMonths": 12,
      "concurrency": {
        "image": 60,
        "video": 20
      },
      "ids": {
        "current": "",
        "historical": []
      }
    }
  }
} as const;
