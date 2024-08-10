import Header from '@/components/Header';
import TransformationForm from '@/components/TransformationForm';
import { transformationTypes } from '@/constants';
import { getUserById } from '@/lib/actions/user.action';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {
  const { userId } = auth();
  const transformation = transformationTypes[type];

  /**
   * Checks if the user is authenticated and retrieves the user's information.
   * If the user is not authenticated, redirects to the sign-in page.
   * @returns {Promise<User>} The user's information.
   */
  if (!userId) redirect('/sign-in');
  const user = await getUserById(userId);

  return (
    <>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />
      <section className='mt-10'>

        <TransformationForm
          action="Add"
          userId={user?._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;