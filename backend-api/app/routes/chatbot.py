from fastapi import APIRouter, HTTPException
import ollama

router = APIRouter()

@router.post("/chat")
async def chatbot(query: dict):
    try:
        user_input = query.get("message", "").strip()
        if not user_input:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        prompt = (
            f"Suppose you are a chatbot for a project that has been built for a project realated to women safety and empowerment. Answer the following question in 50 words or less that has been asked by the user of the project:\n\n{user_input}"
        )

        response = ollama.chat(model="llama3.2:1b", messages=[{"role": "user", "content": prompt}])
        
        return {"response": response["message"]["content"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
