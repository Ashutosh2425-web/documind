import os
import time

from google import genai
from dotenv import load_dotenv


load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def get_answer_from_llm(prompt):
    """
    Generate an answer using Gemini.

    Retries temporary 503 service-unavailable errors
    because Gemini may occasionally experience high demand.
    """

    max_retries = 3

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=prompt
            )

            return response.text

        except Exception as e:
            error_message = str(e)

            if "503" not in error_message:
                raise

            if attempt == max_retries - 1:
                raise

            wait_time = 2 ** attempt

            time.sleep(wait_time)