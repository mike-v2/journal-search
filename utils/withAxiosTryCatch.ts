import { AxiosResponse, isAxiosError } from 'axios';

export const withAxiosTryCatch = async <R>(
  axiosPromise: Promise<AxiosResponse<R>>,
) => {
  try {
    const response = await axiosPromise;
    return { data: response.data, error: undefined };
  } catch (error) {
    let errorMessage: string;

    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        errorMessage = error.response.data;
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'An unknown error occurred';
    }

    return { error: errorMessage, data: undefined };
  }
};
