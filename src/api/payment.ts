import { PAYMENT_FILTER_ATTRIBUTES } from '@/constants/payment-filter.attributes';
import {
  CreatePaymentDto,
  PagedPayment,
  Payment,
  PaymentUploadedFile,
  ToastValidation,
  UpdatePaymentDto
} from '@/types';
import axios from './axios';
import { upload } from './upload';
import { api } from '.';

const findOne = async (
  id: number,
  relations: string[] = [
    'currency',
    'invoices',
    'invoices.invoice',
    'invoices.invoice.currency',
    'uploads',
    'uploads.upload'
  ]
): Promise<Payment & { files: PaymentUploadedFile[] }> => {
  const response = await axios.get<Payment>(`public/payment/${id}?join=${relations.join(',')}`);
  return { ...response.data, files: await getPaymentUploads(response.data) };
};

const findPaginated = async (
  page: number = 1,
  size: number = 5,
  order: 'ASC' | 'DESC' = 'ASC',
  sortKey: string,
  search: string = '',
  relations: string[] = [],
  firmId?: number,
  interlocutorId?: number
): Promise<PagedPayment> => {
  const generalFilter = search
    ? Object.values(PAYMENT_FILTER_ATTRIBUTES)
        .map((key) => `${key}||$cont||${search}`)
        .join('||$or||')
    : '';
  const firmCondition = firmId ? `firmId||$eq||${firmId}` : '';
  const interlocutorCondition = interlocutorId ? `interlocutorId||$cont||${interlocutorId}` : '';
  const filters = [generalFilter, firmCondition, interlocutorCondition].filter(Boolean).join(',');

  const response = await axios.get<PagedPayment>(
    new String().concat(
      'public/payment/list?',
      `sort=${sortKey},${order}&`,
      `filter=${filters}&`,
      `limit=${size}&page=${page}&`,
      `join=${relations.join(',')}`
    )
  );
  return response.data;
};

const uploadPaymentFiles = async (files: File[]): Promise<number[]> => {
  return files && files?.length > 0 ? await upload.uploadFiles(files) : [];
};

const create = async (payment: CreatePaymentDto, files: File[] = []): Promise<Payment> => {
  const uploadIds = await uploadPaymentFiles(files);
  const response = await axios.post<CreatePaymentDto>('public/payment', {
    ...payment,
    uploads: uploadIds.map((id) => {
      return { uploadId: id };
    })
  });
  return response.data;
};

const getPaymentUploads = async (payment: Payment): Promise<PaymentUploadedFile[]> => {
  if (!payment?.uploads) return [];

  const uploads = await Promise.all(
    payment.uploads.map(async (u) => {
      if (u?.upload?.slug) {
        const blob = await api.upload.fetchBlobBySlug(u.upload.slug);
        const filename = u.upload.filename || '';
        if (blob)
          return { upload: u, file: new File([blob], filename, { type: u.upload.mimetype }) };
      }
      return { upload: u, file: undefined };
    })
  );
  return uploads
    .filter((u) => !!u.file)
    .sort(
      (a, b) =>
        new Date(a.upload.createdAt ?? 0).getTime() - new Date(b.upload.createdAt ?? 0).getTime()
    ) as PaymentUploadedFile[];
};

const update = async (payment: UpdatePaymentDto, files: File[] = []): Promise<Payment> => {
  const uploadIds = await uploadPaymentFiles(files);
  const response = await axios.put<Payment>(`public/payment/${payment.id}`, {
    ...payment,
    uploads: [
      ...(payment.uploads || []),
      ...uploadIds.map((id) => {
        return { uploadId: id };
      })
    ]
  });
  return response.data;
};

const remove = async (id: number): Promise<Payment> => {
  const response = await axios.delete<Payment>(`public/payment/${id}`);
  return response.data;
};

const validate = (payment: Partial<Payment>, used: number, paid: number): ToastValidation => {
  if (!payment.date) return { message: 'La date doit être définie' };
  if (!payment?.amount || payment?.amount <= 0)
    return { message: 'Le montant doit être supérieur à 0' };
  if (payment?.fee == null || payment?.fee < 0)
    return { message: 'Le frais doit être supérieur ou égal à 0' };
  if (payment?.fee > payment?.amount) return { message: 'Le frais doit être inférieur au montant' };
  if (paid !== used)
    return { message: 'Le montant total doit être égal à la somme des montants des factures' };
  return { message: '', position: 'bottom-right' };
};

export const payment = { findOne, findPaginated, create, update, remove, validate };
