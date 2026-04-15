function SkillList({ title, skills, colorClass }) {
  const count = skills?.length ?? 0

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
          {count}
        </span>
      </div>

      {count > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={`${title}-${skill}-${index}`}
              className={`rounded-full px-3 py-1 text-sm font-medium ${colorClass}`}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Nothing to show here for this section.</p>
      )}
    </div>
  )
}

export default function SkillsSection({
  matchedSkills,
  missingSkills,
  criticalMissingSkills,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SkillList
        title="Matched Skills"
        skills={matchedSkills}
        colorClass="bg-green-100 text-green-800"
      />
      <SkillList
        title="Missing Skills"
        skills={missingSkills}
        colorClass="bg-yellow-100 text-yellow-800"
      />
      <SkillList
        title="Critical Missing Skills"
        skills={criticalMissingSkills}
        colorClass="bg-red-100 text-red-800"
      />
    </div>
  )
}