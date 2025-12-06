import { Card, Title, Text, Checkbox, Stack, TextInput, Textarea } from '@mantine/core';
import { AudioControls } from '../AudioControls';
import { ParsedAnswer } from '../../utils/voiceAnswerParser';

interface MultipleSelectQuestionProps {
  id: string;
  question: string;
  transparency: string;
  readonly options: readonly { value: string; label: string }[];
  values: string[];
  onChange: (values: string[]) => void;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  comment?: string;
  onCommentChange?: (comment: string) => void;
  commentPlaceholder?: string;
  audioEnabled?: boolean;
}

export function MultipleSelectQuestion({
  id: _id,
  question,
  transparency,
  options,
  values,
  onChange,
  otherValue,
  onOtherChange,
  comment,
  onCommentChange,
  commentPlaceholder = 'Share any additional thoughts...',
  audioEnabled = false,
}: MultipleSelectQuestionProps) {
  const handleAudioAnswer = (answer: ParsedAnswer) => {
    // Set selections if provided
    if (answer.selections && answer.selections.length > 0) {
      // Match selections to option values
      const matchedValues = answer.selections
        .map(selection => {
          const option = options.find(opt =>
            opt.label.toLowerCase() === selection.toLowerCase() ||
            opt.value.toLowerCase() === selection.toLowerCase()
          );
          return option?.value;
        })
        .filter((val): val is string => val !== undefined);

      onChange(matchedValues);
    }

    // If text is provided but no selections matched, append to comment
    if (answer.text && onCommentChange) {
      const existingComment = comment || '';
      const newComment = existingComment
        ? `${existingComment} ${answer.text}`
        : answer.text;
      onCommentChange(newComment);
    }
  };

  const optionLabels = options.map(opt => opt.label);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Title order={3} size="h4">
          {question}
        </Title>

        <Text size="sm" c="dimmed">
          {transparency}
        </Text>

        {audioEnabled && (
          <AudioControls
            questionText={question}
            questionType="multiple-select"
            questionOptions={optionLabels}
            onAnswerCaptured={handleAudioAnswer}
          />
        )}

        <Checkbox.Group value={values} onChange={onChange}>
          <Stack gap="sm">
            {options.map((option) => (
              <Checkbox
                key={option.value}
                value={option.value}
                label={option.label}
              />
            ))}
          </Stack>
        </Checkbox.Group>

        {onOtherChange && (
          <TextInput
            label="Other (please specify)"
            value={otherValue || ''}
            onChange={(e) => onOtherChange(e.currentTarget.value)}
            placeholder="Please specify..."
          />
        )}

        {onCommentChange && (
          <Textarea
            label="Additional comments (optional)"
            value={comment || ''}
            onChange={(e) => onCommentChange(e.currentTarget.value)}
            placeholder={commentPlaceholder}
            minRows={2}
            autosize
          />
        )}
      </Stack>
    </Card>
  );
}
