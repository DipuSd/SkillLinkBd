import ChatInterface from "../../components/ChatInterface";

function AdminMessages() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Support Inbox</h1>
        <p className="text-gray-500">
          Coordinate with clients and providers to resolve disputes quickly.
        </p>
      </header>
      <ChatInterface />
    </div>
  );
}

export default AdminMessages;

