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

    Retries temporary service errors such as 503/UNAVAILABLE
    using exponential backoff.
    """

    max_retries = 4

    for attempt in range(max_retries):

        try:
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=prompt
            )

            return response.text

        except Exception as e:

            error_message = str(e)

            temporary_error = (
                "503" in error_message
                or "UNAVAILABLE" in error_message
                or "high demand" in error_message
                or "temporarily" in error_message.lower()
            )

            if not temporary_error:
                raise

            if attempt == max_retries - 1:
                raise

            wait_time = 2 ** (attempt + 1)

            print(
                f"Gemini temporarily unavailable. "
                f"Retrying in {wait_time} seconds..."
            )

            time.sleep(wait_time)