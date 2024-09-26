import CopyButton from "./CopyButton";

export default function InputData({ input }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 font-semibold">URL</p>
          <p className="text-sm text-gray-300 break-all">
            srt://lvp.streamingpro.es
          </p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold">PORT</p>
          <p className="text-sm text-gray-300">6001</p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold">LATENCY</p>
          <p className="text-sm text-gray-300">120ms</p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold">TIPO</p>
          <p className="text-sm text-gray-300">CALLER</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400 font-semibold">STREAMID</p>
          <div className="flex items-center justify-between ">
            <p className="text-sm text-gray-300 break-all">
              {`${input.streamId}.stream,mode:publish`}
            </p>
            <CopyButton text={`${input.streamId}.stream,mode:publish`} />
          </div>
        </div>
      </div>
    </div>
  );
}
