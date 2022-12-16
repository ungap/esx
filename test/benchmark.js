(async () => {

  const {ESX} = await import('../esm/index.js');
  const {stringify, parse} = await import('../esm/json.js');

  const esx = ESX();

  const program = (a, b, c, d, e) => esx`
    <Object>
      <Array name="static-list" length=${5}>
        <Uint16Array />
        <Uint16Array />
        <Uint16Array />
        <Uint16Array />
        <Uint16Array>
          <Object>
            <Array name="static-list" length=${5}>
              <Uint16Array />
              <Uint16Array />
              <Uint16Array />
              <Uint16Array />
              <Uint16Array />
            </>
            <String>
              This is some static content.
              This is some ${'dynamic'} content.
            </String>
            <Boolean value=${true} />
            <Boolean value=${false} />
            <div>
              <>
                <Number value=${a} />
                <Number value=${b} />
                <Number value=${c} />
                <Number value=${d} />
                <Number value=${e} />
              </>
            </>
          </Object>
        </UInt16Array>
      </>
      <String>
        This is some static content.
        This is some ${'dynamic'} content.
      </String>
      <Boolean value=${true} />
      <Boolean value=${false} />
      <div>
        <>
          <Number value=${a} />
          <Number value=${b} />
          <Number value=${c} />
          <Number value=${d} />
          <Number value=${e} />
        </>
      </>
    </Object>
  `;

  console.time('cold start');
  let output = program(1, 2, 3, 4, 5);
  console.timeEnd('cold start');

  console.time('warm update');
  output = program(6, 7, 8, 9, 0);
  console.timeEnd('warm update');

  console.time('stringify');
  output = stringify(output);
  console.timeEnd('stringify');

  console.time('parse');
  output = parse(output);
  console.timeEnd('parse');
})();
