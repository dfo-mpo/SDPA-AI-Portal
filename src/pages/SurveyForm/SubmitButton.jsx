export default function SubmitButton({ label }) {
  return (
    <button
      type="submit"
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
    >
      {label}
    </button>
  );
}
