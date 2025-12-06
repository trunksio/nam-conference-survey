import { memo } from 'react';
import { LikertQuestion } from './questions/LikertQuestion';
import { LikertWithNAQuestion } from './questions/LikertWithNAQuestion';
import { MultipleSelectQuestion } from './questions/MultipleSelectQuestion';
import { RankingQuestion } from './questions/RankingQuestion';
import { OpenEndedQuestion } from './questions/OpenEndedQuestion';
import { SingleChoiceQuestion } from './questions/SingleChoiceQuestion';
import { TextFieldQuestion } from './questions/TextFieldQuestion';
import { QuestionConfig } from '../config/question-types';
import { SurveyFormState } from '../types/survey';

interface QuestionRendererProps {
  config: QuestionConfig;
  formData: SurveyFormState;
  updateField: <K extends keyof SurveyFormState>(field: K, value: SurveyFormState[K]) => void;
  audioEnabled?: boolean;
}

function QuestionRendererComponent({ config, formData, updateField, audioEnabled = false }: QuestionRendererProps) {
  switch (config.type) {
    case 'likert':
      return (
        <LikertQuestion
          id={config.id}
          question={config.question}
          transparency={config.transparency}
          options={config.options}
          value={formData[config.field] as number | null}
          onChange={(value) => updateField(config.field, value)}
          comment={formData[config.commentField] as string}
          onCommentChange={(comment) => updateField(config.commentField, comment)}
          commentPlaceholder={config.commentPlaceholder}
          audioEnabled={audioEnabled}
        />
      );

    case 'likert-with-na':
      return (
        <LikertWithNAQuestion
          id={config.id}
          question={config.question}
          transparency={config.transparency}
          options={config.options}
          naLabel={config.naLabel}
          value={formData[config.field] as string | null}
          onChange={(value) => updateField(config.field, value)}
          comment={formData[config.commentField] as string}
          onCommentChange={(comment) => updateField(config.commentField, comment)}
          commentPlaceholder={config.commentPlaceholder}
          commentLabel={config.commentLabel}
          audioEnabled={audioEnabled}
        />
      );

    case 'multiple-select':
      return (
        <MultipleSelectQuestion
          id={config.id}
          question={config.question}
          transparency={config.transparency}
          options={config.options}
          values={formData[config.field] as string[]}
          onChange={(values) => updateField(config.field, values)}
          otherValue={config.otherField ? (formData[config.otherField] as string) : undefined}
          onOtherChange={
            config.otherField ? (value) => updateField(config.otherField!, value) : undefined
          }
          comment={config.commentField ? (formData[config.commentField] as string) : undefined}
          onCommentChange={
            config.commentField
              ? (comment) => updateField(config.commentField!, comment)
              : undefined
          }
          commentPlaceholder={config.commentPlaceholder}
          audioEnabled={audioEnabled}
        />
      );

    case 'single-choice':
      return (
        <SingleChoiceQuestion
          id={config.id}
          question={config.question}
          transparency={config.transparency}
          options={config.options}
          value={formData[config.field] as string}
          onChange={(value) => updateField(config.field, value)}
          comment={config.commentField ? (formData[config.commentField] as string) : undefined}
          onCommentChange={
            config.commentField
              ? (comment) => updateField(config.commentField!, comment)
              : undefined
          }
          audioEnabled={audioEnabled}
        />
      );

    case 'ranking':
      return (
        <RankingQuestion
          id={config.id}
          question={config.question}
          transparency={config.transparency}
          options={config.options}
          rankings={formData[config.field] as Record<string, number>}
          onChange={(rankings) => updateField(config.field, rankings)}
          audioEnabled={audioEnabled}
        />
      );

    case 'open-ended':
      return (
        <OpenEndedQuestion
          id={config.id}
          question={config.question}
          transparency={config.transparency}
          value={formData[config.field] as string}
          onChange={(value) => updateField(config.field, value)}
          placeholder={config.placeholder}
          audioEnabled={audioEnabled}
        />
      );

    case 'text-field':
      return (
        <TextFieldQuestion
          id={config.id}
          question={config.question}
          transparency={config.transparency}
          fields={config.fields.map((fieldConfig) => ({
            id: fieldConfig.id,
            label: fieldConfig.label,
            value: formData[fieldConfig.field] as string,
            onChange: (value) => updateField(fieldConfig.field, value),
            placeholder: fieldConfig.placeholder,
          }))}
        />
      );

    default:
      return null;
  }
}

export const QuestionRenderer = memo(QuestionRendererComponent);
