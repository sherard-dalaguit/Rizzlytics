import React from 'react'
import {IconPhoto, IconMessage} from "@tabler/icons-react";
import PhotoAnalysis from "@/components/analysis/PhotoAnalysis";
import ConversationAnalysis from "@/components/analysis/ConversationAnalysis";

const AIReview = () => {
  return (
    <section>
      <div className="mb-20">
        <h1 className="text-4xl font-semibold">AI Review</h1>
        <p className="mt-2 text-zinc-400">Analyze and review content using AI-powered tools.</p>
      </div>

      <div className="flex flex-row gap-6">
        {/* AI Review Tools and Features will be implemented here */}
        <div className="flex flex-col justify-between w-full h-100 p-12 border-2 border-zinc-400 rounded-xl">
          <div>
            <div className="flex flex-row gap-2 mb-4">
              <IconPhoto className="h-8 w-8" />
              <h2 className="text-2xl font-semibold">Photos</h2>
            </div>

            <p className="text-lg text-zinc-400">
              Improve attraction signals & presentation
            </p>
          </div>

          <PhotoAnalysis />
        </div>

        <div className="flex flex-col justify-between w-full h-100 p-12 border-2 border-zinc-400 rounded-xl">
          <div>
            <div className="flex flex-row gap-2 mb-4">
              <IconMessage className="h-8 w-8" />
              <h2 className="text-2xl font-semibold">Conversations</h2>
            </div>

            <p className="text-lg text-zinc-400">
              Diagnose messaging dynamics & next steps
            </p>
          </div>

          <ConversationAnalysis />
        </div>

      </div>
    </section>
  )
}
export default AIReview
