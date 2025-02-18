import axios from './axios';
import { isEmail } from '@/utils/validations/string.validations';
import { address } from './address';
import { Cabinet, ToastValidation, UpdateCabinetDto } from '@/types';
import { upload } from './upload';
import { api } from '.';

const findOne = async (
  id: number,
  loadMedia: 'indeed' | 'falsely' = 'falsely'
): Promise<Cabinet> => {
  const response = await axios.get<Cabinet>(`public/cabinet/${id}`);
  if (loadMedia != 'falsely') {
    const logoBlob = response.data.logoId
      ? await api.upload.fetchBlobById(response.data.logoId)
      : undefined;
    const signatureBlob = response.data.signatureId
      ? await api.upload.fetchBlobById(response.data.signatureId)
      : undefined;
    return {
      ...response.data,
      logo: logoBlob ? new File([logoBlob], 'logo', { type: logoBlob.type }) : undefined,
      signature: signatureBlob
        ? new File([signatureBlob], 'signature', { type: signatureBlob.type })
        : undefined
    };
  }
  return response.data;
};

const update = async (cabinet: UpdateCabinetDto): Promise<Cabinet> => {
  const logoId = cabinet.logo ? (await upload.uploadFile(cabinet.logo)).id : undefined;
  const signatureId = cabinet.signature
    ? (await upload.uploadFile(cabinet.signature)).id
    : undefined;
  const { logo, signature, ...payload } = cabinet;
  const response = await axios.put<Cabinet>(`public/cabinet/${cabinet.id}`, {
    ...payload,
    logoId: logoId || null,
    signatureId: signatureId || null
  });
  return response.data;
};

const validate = (cabinet: Partial<Cabinet>): ToastValidation => {
  if (!cabinet.enterpriseName) return { message: 'Nom du Cabinet est obligatoire' };
  if (!cabinet.email)
    return { message: 'Il est préférable que le champ e-mail soit présent', type: 'warning' };
  if (!isEmail(cabinet?.email || '')) return { message: 'E-mail invalide' };

  if (!cabinet.taxIdNumber) return { message: "Numéro d'idnetification fiscale est obligatoire" };

  const addressValidation = cabinet?.address ? address.validate(cabinet?.address) : undefined;
  if (addressValidation?.message) return addressValidation;
  return { message: '' };
};

export const cabinet = { findOne, update, validate };
