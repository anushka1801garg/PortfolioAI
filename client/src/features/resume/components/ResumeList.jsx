import ResumeCard from "./ResumeCard";

const ResumeList = ({ resumes, loading }) => {
  if (loading) {
    return <p className="mt-6">Loading...</p>;
  }

  if (resumes.length === 0) {
    return <p className="mt-6">No resumes uploaded yet.</p>;
  }

  return (
    <div className="mt-8 grid gap-5">
      {resumes.map((resume) => (
        <ResumeCard key={resume._id} resume={resume} />
      ))}
    </div>
  );
};

export default ResumeList;
