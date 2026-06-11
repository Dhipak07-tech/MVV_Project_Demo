import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOrganizationSchema, type CreateOrganizationInput } from '../types/organization.types';
import { useCreateOrganization } from '../hooks/useOrganizations';

interface Props {
  onClose: () => void;
}

export default function CreateOrganizationModal({ onClose }: Props) {
  const createMutation = useCreateOrganization();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(CreateOrganizationSchema),
  });

  const onSubmit = async (data: CreateOrganizationInput) => {
    try {
      await createMutation.mutateAsync(data);
      onClose();
    } catch { /* handled by mutation */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-lg bg-vault-card border border-border-default rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text-primary">New Organization</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-vault-elevated"><X className="w-5 h-5 text-text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Name *</label>
            <input {...register('name')} className="input-field" placeholder="Acme Corporation" />
            {errors.name && <p className="mt-1 text-xs text-status-danger">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea {...register('description')} className="input-field min-h-[80px]" placeholder="Brief description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Industry</label>
              <input {...register('industry')} className="input-field" placeholder="Technology" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Company Size</label>
              <input {...register('companySize')} className="input-field" placeholder="50-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input {...register('email')} className="input-field" placeholder="info@acme.com" />
              {errors.email && <p className="mt-1 text-xs text-status-danger">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
              <input {...register('phone')} className="input-field" placeholder="+1 555-0100" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Website</label>
            <input {...register('website')} className="input-field" placeholder="https://acme.com" />
            {errors.website && <p className="mt-1 text-xs text-status-danger">{errors.website.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
