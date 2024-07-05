from flask import Flask, request, jsonify
from openai import OpenAI
from typing_extensions import override
from openai import AssistantEventHandler

app = Flask(__name__)

# Initialize OpenAI client
client = OpenAI(api_key='')

# Dictionary to store results temporarily
results = {}

class EventHandler(AssistantEventHandler):    
    def __init__(self, thread_id):
        super().__init__()
        self.thread_id = thread_id
        self.result = ""

    @override
    def on_text_created(self, text) -> None:
        self.result += text.value  # Convert Text object to string
      
    @override
    def on_text_delta(self, delta, snapshot):
        self.result += delta.value
        
    def on_tool_call_created(self, tool_call):
        self.result += f"\nassistant > {tool_call.type}\n"
    
    def on_tool_call_delta(self, delta, snapshot):
        if delta.type == 'code_interpreter':
            if delta.code_interpreter.input:
                self.result += delta.code_interpreter.input
            if delta.code_interpreter.outputs:
                self.result += f"\n\noutput >"
                for output in delta.code_interpreter.outputs:
                    if output.type == "logs":
                        self.result += f"\n{output.logs}"
    
    def save_result(self):
        results[self.thread_id] = self.result

# Route to create an assistant
@app.route('/create_assistant', methods=['POST'])
def create_assistant():
    assistant = client.beta.assistants.create(
        name="Math Tutor",
        instructions="You are programer. Write and run code to answer programming questions.",
        tools=[{"type": "code_interpreter"}],
        model="gpt-4o",
    )
    return jsonify({'assistant_id': assistant.id})

# Route to start a conversation (create a thread)
@app.route('/start_conversation', methods=['POST'])
def start_conversation():
    thread = client.beta.threads.create()
    return jsonify({'thread_id': thread.id})

# Route to add a message to the thread
@app.route('/add_message', methods=['POST'])
def add_message():
    data = request.json
    thread_id = data['thread_id']
    content = data['content']
    
    message = client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=content
    )
    return jsonify({'message_id': message.id})

# Route to run the assistant on the thread and stream the response
@app.route('/run_assistant', methods=['POST'])
def run_assistant():
    data = request.json
    thread_id = data['thread_id']
    assistant_id = data['assistant_id']
    
    event_handler = EventHandler(thread_id)
    
    with client.beta.threads.runs.stream(
        thread_id=thread_id,
        assistant_id=assistant_id,
        event_handler=event_handler,
    ) as stream:
        stream.until_done()
    
    event_handler.save_result()
    
    return jsonify({'status': 'completed'})

# Route to get the result of the message
@app.route('/get_result', methods=['GET'])
def get_result():
    thread_id = request.args.get('thread_id')
    result = results.get(thread_id, "No result found")
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)
