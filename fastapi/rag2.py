# from IPython.display import Markdown, display
import requests

input="You are an SQL query writer. Your "
API_URL = "https://api-inference.huggingface.co/models/codellama/CodeLlama-34b-Instruct-hf"
headers = {"Authorization": "Bearer HUGGING_FACE"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
        "inputs": input,
})

# while(output[0]['generated_text']!=input):
#     input=output[0]['generated_text']
#     output=query({'inputs':input})
#     print("Output: ")
#     print(output[0]['generated_text'])
#     print("\n")
#     print("Input: ")
#     print(input)

print("Final Output: ")
print(output)
# display(Markdown(output[0]['generated_text']))