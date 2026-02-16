// Victory button HTML token helper
const victoryButton = (count: number): string => {
  const label = count === 1 ? "1 Victory" : `${count} Victories`
  return `<span data-victory-button="true" data-victory-count="${count}" contenteditable="false">${label}</span>`
}

export const DEFAULT_OUTCOMES_HTML = `<h2>Montage Outcomes</h2>
<h4>Total Success</h4>
<p>If the heroes earn a total success, they achieve what they set out to do without complication.</p>
<p>The heroes earn 1 Victory when they achieve total success on an easy or moderate montage test, and 2 Victories on a hard montage test.</p>
<p>${victoryButton(1)} or ${victoryButton(2)}</p>
<h4>Partial Success</h4>
<p>If the heroes earn a partial success, they succeed at what they set out to do, but there is a complication or a cost involved.</p>
<p>The heroes earn 1 Victory when they achieve partial success on a hard or moderate montage test.</p>
<p>${victoryButton(1)}</p>
<h4>Total Failure</h4>
<p>If the heroes suffer total failure, they don't achieve what they set out to do.</p>`
