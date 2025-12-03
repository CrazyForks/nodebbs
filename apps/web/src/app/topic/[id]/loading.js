import { Loading } from '@/components/common/Loading';

export default function LoadingPage() {
  // 你可以在这里放骨架屏
  return (
    <Loading
      variant='overlay'
      text='加载中...'
      className='pointer-events-none bg-transparent backdrop-blur-none'
    />
  );
}
