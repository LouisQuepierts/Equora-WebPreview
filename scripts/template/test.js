import { setupConfig} from "../cache.js";

const DEFAULT = {
    "Morning": [
        {
            "id": "1",
            "task": "Buy groceries",
            "status": "Delayed"
        },
        {
            "id": "2",
            "time": "12:00",
            "task": "Cook lunch",
            "status": "Pending"
        }
    ],
    "Afternoon": [
        {
            "id": "3",
            "task": "Go to gym",
            "status": "Pending"
        }
    ],
    "Evening": [
        {
            "id": "4",
            "task": "Start assignments",
            "status": "Pending"
        }
    ]
}

const TIME_BOXES = [
    {
        "name": "Morning",
        "tasks": [
            {
                "id": "1",
                "task": "Buy groceries",
                "status": "Delayed"
            },
            {
                "id": "2",
                "time": "12:00",
                "task": "Cook lunch",
                "status": "Pending"
            }
        ]
    },
    {
        "name": "Afternoon",
        "tasks": [
            {
                "id": "3",
                "task": "Go to gym",
                "status": "Pending"
            }
        ]
    },
    {
        "name": "Evening",
        "tasks": [
            {
                "id": "4",
                "task": "Start assignments",
                "status": "Pending"
            }
        ]
    }
]

setupConfig(DEFAULT);