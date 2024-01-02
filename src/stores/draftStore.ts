import { ref, watchEffect } from 'vue';
import { useLocalForage } from '@/composables/useLocalForage';
import { filter, last } from 'lodash-es';
import { defineStore } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

export enum LocalDraftEntryStatusEnum {
  /**
   * The state the form will be in for most of its live.
   * Whether the user uses 'save & continues' options or they go offline a form submission will be in this state until otherwise.
   */
  InProgress = `IN_PROGRESS`,
  /**
   * Follow Up Form is ready for submission, other than waiting for the parent follow up to form to be submitted.
   * Follow up Forms usually need data returned from the parent submission mutation result, such as `entryId`
   */
  AwaitingFollowUpToForm = `AWAITING_FOLLOW_UP_TO_FORM`,
  /**
   * Ready to submit once network connection is re-established
   */
  AwaitingOnlineStatus = `AWAITING_ONLINE_STATUS`,
  /**
   * Set when there has been an attempt to submit but failed
   */
  ErrorOnSubmit = `ERROR_ON_SUBMIT`,
  /**
   * Draft Entry created and used for editing the entry on the server
   */
  UpdateInProgress = `UPDATE_IN_PROGRESS`,
  /**
   * When a user has failed a quiz and needs to fix their answers
   */
  QuizFailed = `QUIZ_FAILED`,
}

type FieldValues = Record<string, unknown>;

export interface CreateDraftEntryArgs {
  fieldValues?: FieldValues;
  form: LocalDraftEntry['form'];
  followUpToForm?: LocalDraftEntry['followUpToForm'];
  status?: LocalDraftEntryStatusEnum;
  listFiles?: string[];
}

export interface UpdateDraftEntryArgs {
  draftId: number;
  fieldValues?: FieldValues;
  status?: LocalDraftEntryStatusEnum;
  lastPage?: number;
  errors?: LocalDraftEntry['errors'];
  followUpToForm?: LocalDraftEntry['followUpToForm'];
  listFiles?: string[];
}

export interface FollowUpToForm {
  /**
   * The draftId of the parent follow up to form that has triggered the follow up form.
   */
  draftId?: number;
  /** url to redirect the user back to on the parent form after follow up form done */
  fromUrl?: string;
  /** formId of the parent form */
  formId?: string;
  formSlug?: string;
  entryId?: string;
  formTitle?: string;

  componentId?: number | string;
  deficiencyIds?: number[];
}

export interface LocalDraftEntry {
  /**
   * client side managed, auto-incrementing id for drafts
   */
  draftId: number;
  /**
   * EntryId of the Follow Up To Form's successful submission returned entryId
   */
  entryId?: number;
  form?: {
    /**
     * For update Local Draft entry we need the entryId to update
     */
    entryId?: number;
    type?: 'form' | 'quiz';
    formTitle?: string;
    formId?: string;
    formSlug?: string;
  };
  /**
   * Status of the DraftEntry
   */
  status: LocalDraftEntryStatusEnum;
  /**
   * FieldValues in the shape expected by the client side form renderer
   */
  fieldValues?: FieldValues;
  /**
   * Follow up to form data. The parent form which caused the follow up form to be triggered.
   * Will be set to null when the form is not a child of another form
   */
  followUpToForm?: FollowUpToForm;
  lastPage?: number;
  errors?: {
    id?: string;
    message?: string;
  }[];
  lastUpdated?: Date;
  listFiles?: string[];
}

/**
 * Represents a collection of local draft entries, where each entry is identified by a unique draftId.
 */
export type LocalDraftEntries = {
  [draftId: number]: LocalDraftEntry;
};

const STORAGE_CORRECTIVE_ACTION_KEY = 'corrective-action-draft';

export const useDraftCorrectiveActionStore = defineStore(STORAGE_CORRECTIVE_ACTION_KEY, () => {
  const {
    storedValue: localDraftEntries,
    setValue: setLocalDraftEntries,
    getValue: getDraftEntries,
  } = useLocalForage<LocalDraftEntries>(STORAGE_CORRECTIVE_ACTION_KEY, {});

  async function getDraftEntryById(draftId?: number): Promise<LocalDraftEntry | undefined> {
    if (!draftId) {
      return undefined;
    }
    const draftEntries = await getDraftEntries();
    return draftEntries?.[draftId];
  }

  async function updateDraftEntry({
    draftId,
    fieldValues,
    status,
    lastPage,
    errors,
    followUpToForm,
    listFiles,
  }: UpdateDraftEntryArgs): Promise<LocalDraftEntry | undefined> {
    const draftEntries = await getDraftEntries();
    const draftEntry = draftEntries?.[draftId];
    if (!draftEntry) {
      return;
    }
    const updatedFieldValues = {
      ...(draftEntry.fieldValues ?? {}),
      ...(fieldValues ?? {}),
    };
    const updatedDraftEntry: LocalDraftEntry = {
      ...draftEntry,
      fieldValues: updatedFieldValues,
      status: status ?? draftEntry.status,
      lastPage: lastPage ?? draftEntry.lastPage,
      errors: errors ?? draftEntry.errors,
      followUpToForm: followUpToForm
        ? { ...draftEntry?.followUpToForm, ...followUpToForm }
        : undefined,
      lastUpdated: new Date(),
      listFiles,
    };
    draftEntries[draftId] = updatedDraftEntry;
    await setLocalDraftEntries(draftEntries);
    return updatedDraftEntry;
  }

  function getFollowUpFormDraftEntries(draftId: number): LocalDraftEntries {
    return filter(localDraftEntries.value, (draft) => {
      const statusMatch =
        draft?.status === LocalDraftEntryStatusEnum[`AwaitingFollowUpToForm`] ||
        draft?.status === LocalDraftEntryStatusEnum[`ErrorOnSubmit`];
      const draftIdMatch = draft?.followUpToForm?.draftId === draftId;
      return statusMatch && draftIdMatch;
    });
  }

  async function removeDraftEntries(draftIds: number[]) {
    const draftEntries = await getDraftEntries();
    const newDraftEntries = filter(draftEntries, (draft) => {
      return !draftIds.includes(Number(draft.draftId));
    });
    await setLocalDraftEntries(newDraftEntries);
  }

  async function removeAllDraftEntries() {
    await setLocalDraftEntries({});
  }

  async function getLastDraftId(): Promise<number> {
    const localDraftEntries = await getDraftEntries();
    const draftIds = Object.keys(localDraftEntries ?? {})
      .map((draftId) => parseInt(draftId))
      .sort((a, b) => {
        return a - b;
      });
    return last(draftIds) ?? 0;
  }

  async function createDraftEntry(args: CreateDraftEntryArgs) {
    const { form, fieldValues: fieldValuesArg, followUpToForm, status, listFiles } = args;

    const lastDraftId = await getLastDraftId();
    const nextDraftId = lastDraftId + 1;
    const fieldValues = fieldValuesArg;

    const localDraftEntry: LocalDraftEntry = {
      draftId: nextDraftId,
      fieldValues,
      followUpToForm,
      form,
      lastUpdated: new Date(),
      status: status ?? LocalDraftEntryStatusEnum[`UpdateInProgress`],
      listFiles,
    };
    await setLocalDraftEntries((state) => ({
      ...state,
      [nextDraftId]: localDraftEntry,
    }));

    return localDraftEntry;
  }

  async function addDraftEntry(draftEntry: LocalDraftEntry) {
    await setLocalDraftEntries((drafts) => ({
      ...drafts,
      [draftEntry.draftId]: draftEntry,
    }));
  }

  return {
    state: localDraftEntries,
    getDraftEntries,
    getDraftEntryById,
    removeDraftEntries,
    updateDraftEntry,
    getFollowUpFormDraftEntries,
    removeAllDraftEntries,
    createDraftEntry,
    getLastDraftId,
    addDraftEntry,
  };
});

const STORAGE_FORM_DATA_KEY = 'form-data-draft';

export const useDraftFormDataStore = defineStore(STORAGE_FORM_DATA_KEY, () => {
  const {
    storedValue: localDraftEntries,
    setValue: setLocalDraftEntries,
    getValue: getDraftEntries,
  } = useLocalForage<LocalDraftEntries>(STORAGE_FORM_DATA_KEY, {});

  async function getDraftEntryById(draftId?: number): Promise<LocalDraftEntry | undefined> {
    if (!draftId) {
      return undefined;
    }
    const draftEntries = await getDraftEntries();
    return draftEntries?.[draftId];
  }

  async function updateDraftEntry({
    draftId,
    fieldValues,
    status,
    lastPage,
    errors,
    followUpToForm,
    listFiles,
  }: UpdateDraftEntryArgs): Promise<LocalDraftEntry | undefined> {
    const draftEntries = await getDraftEntries();
    const draftEntry = draftEntries?.[draftId];
    if (!draftEntry) {
      return;
    }
    const updatedFieldValues = {
      ...(draftEntry.fieldValues ?? {}),
      ...(fieldValues ?? {}),
    };
    const updatedDraftEntry: LocalDraftEntry = {
      ...draftEntry,
      fieldValues: updatedFieldValues,
      status: status ?? draftEntry.status,
      lastPage: lastPage ?? draftEntry.lastPage,
      errors: errors ?? draftEntry.errors,
      followUpToForm: followUpToForm
        ? { ...draftEntry?.followUpToForm, ...followUpToForm }
        : undefined,
      lastUpdated: new Date(),
      listFiles,
    };
    draftEntries[draftId] = updatedDraftEntry;
    await setLocalDraftEntries(draftEntries);
    return updatedDraftEntry;
  }

  function getFollowUpFormDraftEntries(draftId: number): LocalDraftEntries {
    return filter(localDraftEntries.value, (draft) => {
      const statusMatch =
        draft?.status === LocalDraftEntryStatusEnum[`AwaitingFollowUpToForm`] ||
        draft?.status === LocalDraftEntryStatusEnum[`ErrorOnSubmit`];
      const draftIdMatch = draft?.followUpToForm?.draftId === draftId;
      return statusMatch && draftIdMatch;
    });
  }

  async function removeDraftEntries(draftIds: number[]) {
    const draftEntries = await getDraftEntries();
    const newDraftEntries = filter(draftEntries, (_draft, draftId) => {
      return !draftIds.includes(Number(draftId));
    });
    await setLocalDraftEntries(newDraftEntries);
  }

  async function removeAllDraftEntries() {
    await setLocalDraftEntries({});
  }

  async function getLastDraftId(): Promise<number> {
    const localDraftEntries = await getDraftEntries();
    const draftIds = Object.keys(localDraftEntries ?? {})
      .map((draftId) => parseInt(draftId))
      .sort((a, b) => {
        return a - b;
      });
    return last(draftIds) ?? 0;
  }

  async function createDraftEntry(args: CreateDraftEntryArgs) {
    const { form, fieldValues: fieldValuesArg, followUpToForm, status, listFiles } = args;

    const lastDraftId = await getLastDraftId();
    const nextDraftId = lastDraftId + 1;

    const fieldValues = fieldValuesArg;

    const localDraftEntry: LocalDraftEntry = {
      draftId: nextDraftId,
      fieldValues,
      followUpToForm,
      form,
      lastUpdated: new Date(),
      status: status ?? LocalDraftEntryStatusEnum[`UpdateInProgress`],
      listFiles,
    };
    await setLocalDraftEntries((state) => ({
      ...state,
      [nextDraftId]: localDraftEntry,
    }));

    return localDraftEntry;
  }

  async function addDraftEntry(draftEntry: LocalDraftEntry) {
    await setLocalDraftEntries((drafts) => ({
      ...drafts,
      [draftEntry.draftId]: draftEntry,
    }));
  }

  return {
    state: localDraftEntries,
    getDraftEntries,
    getDraftEntryById,
    removeDraftEntries,
    updateDraftEntry,
    getFollowUpFormDraftEntries,
    removeAllDraftEntries,
    createDraftEntry,
    getLastDraftId,
    addDraftEntry,
  };
});
/**
 * Custom hook for managing draft entries.
 *
 * @param {Object} options - The options for the hook.
 * @param {string} options.formId - The ID of the form.
 * @param {string} options.formTitle - The title of the form.
 * @param {string} options.formSlug - The slug of the form.
 * @param {number} options.pageNumber - The current page number.
 * @param {number} [options.urlDraftId] - The ID of the draft entry from the URL.
 * @param {'form' | 'quiz'} options.formType - The type of the form.
 * @returns {Object} - The local draft entry.
 */
export function useDraft({
  formId,
  formTitle,
  formSlug,
  pageNumber,
  urlDraftId,
  formType,
}: {
  formId: string;
  formTitle: string;
  formSlug: string;
  pageNumber: number;
  urlDraftId?: number;
  formType: 'form' | 'quiz';
}) {
  const draftStore = useDraftCorrectiveActionStore();
  const router = useRouter();
  const route = useRoute();
  const localDraftEntry = ref<LocalDraftEntry | undefined>();

  watchEffect(() => {
    (async () => {
      const existingDraftEntry = urlDraftId
        ? await draftStore.getDraftEntryById(urlDraftId)
        : undefined;

      localDraftEntry.value = existingDraftEntry;
      const lastDraftId = await draftStore.getLastDraftId();
      const nextDraftId = lastDraftId + 1;

      if (pageNumber !== 1 && !localDraftEntry.value) {
        const pathParts = route.path.split('/');
        pathParts.pop();
        pathParts.push(`page1`);
        const newPath = pathParts.join('/');
        router.replace({
          path: newPath,
          replace: true,
        });
        return;
      }

      if (formId && pageNumber === 1 && !localDraftEntry.value && nextDraftId) {
        const newDraft: LocalDraftEntry = {
          draftId: nextDraftId,
          fieldValues: {},
          form: {
            formId,
            formTitle,
            formSlug,
            type: formType,
          },
          status: LocalDraftEntryStatusEnum[`InProgress`],
        };

        localDraftEntry.value = newDraft;
        await draftStore.addDraftEntry(newDraft);

        router.replace({
          path: route.path,
          query: {
            ...route.query,
            draftId: newDraft.draftId,
          },
          replace: true,
        });
      }
    })();
  });

  return {
    localDraftEntry,
  };
}
