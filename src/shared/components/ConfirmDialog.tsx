import { PixelModal } from './PixelModal';
import { PixelButton } from './PixelButton';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <PixelModal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <PixelButton variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </PixelButton>
          <PixelButton
            variant={destructive ? 'secondary' : 'primary'}
            onClick={onConfirm}
            className={destructive ? 'border-dashed' : ''}
          >
            {confirmLabel}
          </PixelButton>
        </>
      }
    >
      <p className="text-sm text-gray-100">{message}</p>
    </PixelModal>
  );
}
