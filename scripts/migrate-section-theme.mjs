import fs from 'fs';
import path from 'path';

const root = path.resolve('app/components/sections');

function stripFontRefs(s) {
  return s
    .replace(/\$\{cormorant\.className\}\s*/g, '')
    .replace(/\$\{manrope\.className\}\s*/g, '')
    .replace(/\s*\$\{manrope\.variable\}/g, '');
}

function addHook(s, marker, hook) {
  if (s.includes('const theme = useSectionTheme()')) return s;
  const idx = s.indexOf(marker);
  if (idx === -1) throw new Error('marker not found: ' + marker);
  const insertAt = idx + marker.length;
  return s.slice(0, insertAt) + hook + s.slice(insertAt);
}

const hook = '\n  const theme = useSectionTheme();\n  const { colors, fonts, styles } = theme;';

// ProjectsSection
{
  let s = fs.readFileSync(path.join(root, 'ProjectsSection.tsx'), 'utf8');
  s = stripFontRefs(s);
  s = addHook(s, '}) => {\n  const { projects, pages }', hook);
  s = s.replace(
    'className={cn(`relative overflow-hidden py-20 lg:py-32`, className)}',
    'className={cn(\'relative overflow-hidden py-20 lg:py-32\', className)}\n      style={{ fontFamily: fonts.body }}'
  );
  s = s.replace(
    '<motion/div className="absolute inset-0 bg-gradient-to-br from-[#f8f8f5] via-[#f0f4f1] to-[#e8f0ea]" />',
    '<div className="absolute inset-0" style={styles.sectionGradientBgAlt} />'
  );
  s = s.replace(
    '<motion/div className="absolute inset-0 bg-gradient-to-br from-[#f8f8f5] via-[#f0f4f1] to-[#e8f0ea]" />',
    '<div className="absolute inset-0" style={styles.sectionGradientBgAlt} />'
  );
  s = s.replace(
    '<div className="absolute inset-0 bg-gradient-to-br from-[#f8f8f5] via-[#f0f4f1] to-[#e8f0ea]" />',
    '<div className="absolute inset-0" style={styles.sectionGradientBgAlt} />'
  );
  s = s.replace(
    /className="absolute w-1 h-1 bg-\[#7A9A5C\] rounded-full opacity-25 animate-float"/g,
    'className="absolute w-1 h-1 rounded-full opacity-25 animate-float" style={styles.floatingDot}'
  );
  s = s.replace(
    "style={{ background: 'linear-gradient(135deg, #7A9A5C, #5D6939)' }}",
    'style={styles.iconBadge}'
  );
  s = s.replace(
    /style=\{\{\s*background: 'linear-gradient\(135deg, #242A26 0%, #7A9A5C 100%\)',\s*WebkitBackgroundClip: 'text',\s*WebkitTextFillColor: 'transparent',\s*backgroundClip: 'text',\s*\}\}/g,
    'style={{ fontFamily: fonts.heading, ...styles.titleGradient }}'
  );
  s = s.replace(/<div className="w-16 h-px bg-\[#7A9A5C\]\/30" \/>/g, '<div className="w-16 h-px" style={styles.dividerLine} />');
  s = s.replace(/<div className="w-4 h-4 bg-\[#7A9A5C\] rounded-full mx-6 animate-pulse" \/>/g, '<div className="w-4 h-4 rounded-full mx-6 animate-pulse" style={styles.dividerDot} />');
  s = s.replace(
    'mx-auto max-w-3xl text-lg text-[#242A26]/70 leading-relaxed',
    'mx-auto max-w-3xl text-lg leading-relaxed'
  );
  s = s.replace(
    /className=\{`\s*inline-block px-8 py-4 bg-\[#2A2A2A\] text-white font-medium text-sm tracking-wide uppercase transition-all duration-500 hover:bg-\[#7A9A5C\] hover:shadow-2xl hover:-translate-y-1`\}/g,
    'className="inline-block px-8 py-4 font-medium text-sm tracking-wide uppercase transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"\n                  style={{ ...styles.primaryCta, fontFamily: fonts.body, backgroundColor: colors.mainText }}'
  );
  s = s.replace(
    'border border-[#7A9A5C]/10 bg-white/90',
    'border bg-white/90'
  );
  s = s.replace(
    '<article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">',
    '<article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl" style={styles.card}>'
  );
  s = s.replace(
    'overflow-hidden bg-[#e8f0ea]"',
    'overflow-hidden" style={styles.imagePlaceholder}'
  );
  s = s.replace(
    'justify-center text-[#7A9A5C]/40"',
    'justify-center" style={{ color: `color-mix(in srgb, ${colors.primaryButton} 40%, transparent)` }}'
  );
  s = s.replace(
    'bg-gradient-to-t from-[#7A9A5C]/60 via-transparent to-transparent',
    'bg-gradient-to-t via-transparent to-transparent'
  );
  s = s.replace(
    '<div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />',
    '<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={styles.imageOverlay} />'
  );
  s = s.replace(
    'uppercase tracking-wide text-[#242A26]`}',
    'uppercase tracking-wide`}\n                        style={{ color: colors.mainText, fontFamily: fonts.body }}'
  );
  s = s.replace(
    'text-xl md:text-2xl font-semibold text-[#242A26] group-hover:text-[#7A9A5C] transition-colors`}',
    'text-xl md:text-2xl font-semibold transition-colors hero-card-title`}\n                        style={{ fontFamily: fonts.heading, color: colors.mainText }}'
  );
  s = s.replace(
    'shrink-0 text-xs font-medium text-[#7A9A5C]`}',
    'shrink-0 text-xs font-medium`}\n                          style={{ ...styles.accentText, fontFamily: fonts.body }}'
  );
  s = s.replace(
    'line-clamp-3 flex-1 text-sm text-[#242A26]/70 leading-relaxed`}',
    'line-clamp-3 flex-1 text-sm leading-relaxed`}\n                        style={{ color: colors.secondaryText, fontFamily: fonts.body }}'
  );
  s = s.replace(
    'text-xs font-medium uppercase tracking-wide text-[#7A9A5C]`}',
    'text-xs font-medium uppercase tracking-wide`}\n                      style={{ ...styles.accentText, fontFamily: fonts.body }}'
  );
  s = s.replace(
    'text-center text-sm text-[#242A26]/60`}',
    'text-center text-sm`}\n            style={{ color: colors.secondaryText, fontFamily: fonts.body }}'
  );
  if (!s.includes('hero-card-title:hover')) {
    s = s.replace(
      '<style jsx>{`',
      `<style jsx>{\`
        :global(.hero-card-title) {
          transition: color 0.3s;
        }
        :global(.group:hover .hero-card-title) {
          color: var(--wb-primary);
        }
`
    );
  }
  fs.writeFileSync(path.join(root, 'ProjectsSection.tsx'), s);
  console.log('ProjectsSection done');
}

// WhyChooseUsSection
{
  let s = fs.readFileSync(path.join(root, 'WhyChooseUsSection.tsx'), 'utf8');
  if (!s.includes("useSectionTheme")) {
    s = s.replace(
      "import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';",
      "import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';\nimport { useSectionTheme } from '@/app/hooks/useSectionTheme';"
    );
  }
  s = stripFontRefs(s);
  s = addHook(s, 'export function WhyChooseUsSection({ whyChooseUsSection, className }: WhyChooseUsSectionProps) {', hook);
  s = s.replace(
    'className={cn(`relative py-20 lg:py-32 overflow-hidden`, className)}',
    'className={cn(\'relative py-20 lg:py-32 overflow-hidden\', className)}\n      style={{ fontFamily: fonts.body }}'
  );
  s = s.replace(
    '<div className="absolute inset-0 bg-gradient-to-br from-[#f0f4f1] via-[#f8f8f5] to-[#e8f0ea]" />',
    '<div className="absolute inset-0" style={styles.sectionGradientBg} />'
  );
  s = s.replace(
    /className="absolute w-1 h-1 bg-\[#7A9A5C\] rounded-full opacity-25 animate-float"/g,
    'className="absolute w-1 h-1 rounded-full opacity-25 animate-float" style={styles.floatingDot}'
  );
  s = s.replace("style={{ background: 'linear-gradient(135deg, #7A9A5C, #5D6939)' }}", 'style={styles.iconBadge}');
  s = s.replace(
    /style=\{\{\s*background: 'linear-gradient\(135deg, #242A26 0%, #7A9A5C 100%\)',\s*WebkitBackgroundClip: 'text',\s*WebkitTextFillColor: 'transparent',\s*backgroundClip: 'text',\s*\}\}/g,
    'style={{ fontFamily: fonts.heading, ...styles.titleGradient }}'
  );
  s = s.replace(/<div className="w-16 h-px bg-\[#7A9A5C\]\/30" \/>/g, '<motion/div className="w-16 h-px" style={styles.dividerLine} />');
  s = s.replace(/<div className="w-4 h-4 bg-\[#7A9A5C\] rounded-full mx-6 animate-pulse" \/>/g, '<div className="w-4 h-4 rounded-full mx-6 animate-pulse" style={styles.dividerDot} />');
  s = s.replace('text-lg md:text-xl text-[#242A26]/70 max-w-3xl', 'text-lg md:text-xl max-w-3xl');
  s = s.replace(
    'text-lg md:text-xl max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300',
    'text-lg md:text-xl max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300"\n              style={{ color: colors.secondaryText, fontFamily: fonts.body }'
  );
  // fix broken quote above - need manual fix
  s = s.replace(
    'border border-[#7A9A5C]/10 shadow-lg',
    'border shadow-lg'
  );
  s = s.replace(
    'rounded-3xl p-8 lg:p-10 border shadow-lg hover:shadow-2xl',
    'rounded-3xl p-8 lg:p-10 border shadow-lg hover:shadow-2xl"\n                  style={styles.card'
  );
  s = s.replace(
    'text-white shadow-lg bg-gradient-to-br from-[#7A9A5C] to-[#5D6939] group-hover:animate-pulse"',
    'text-white shadow-lg group-hover:animate-pulse"\n                        style={{ ...styles.statCircle, color: \'var(--wb-text-on-dark, #fff)\' }}'
  );
  s = s.replace(
    'text-3xl font-semibold leading-none`}',
    'text-3xl font-semibold leading-none`}\n                          style={{ fontFamily: fonts.heading }}'
  );
  s = s.replace(
    'text-xl md:text-2xl font-semibold text-[#242A26] group-hover:text-[#7A9A5C] transition-colors`}',
    'text-xl md:text-2xl font-semibold transition-colors wcu-card-title`}\n                          style={{ fontFamily: fonts.heading, color: colors.mainText }}'
  );
  s = s.replace(
    'text-[#242A26]/80 leading-relaxed mb-6 flex-1`}',
    'leading-relaxed mb-6 flex-1`}\n                          style={{ color: colors.mainText, opacity: 0.8, fontFamily: fonts.body }}'
  );
  s = s.replace(
    'text-xl md:text-2xl font-semibold text-[#242A26] mt-auto group-hover:text-[#7A9A5C] transition-colors`}',
    'text-xl md:text-2xl font-semibold mt-auto transition-colors wcu-card-title`}\n                          style={{ fontFamily: fonts.heading, color: colors.mainText }}'
  );
  s = s.replace('<div className="w-2 h-2 bg-[#7A9A5C] rounded-full animate-pulse" />', '<div className="w-2 h-2 rounded-full animate-pulse" style={styles.dividerDot} />');
  s = s.replace('<div className="w-8 h-px bg-[#7A9A5C]/40" />', '<div className="w-8 h-px" style={styles.dividerLine} />');
  s = s.replace(
    '<div className="w-2 h-2 bg-[#5D6939] rounded-full animate-pulse" style={{ animationDelay: \'0.5s\' }} />',
    '<motion/div className="w-2 h-2 rounded-full animate-pulse" style={{ ...styles.dividerDot, backgroundColor: colors.hoverActive, animationDelay: \'0.5s\' }} />'
  );
  s = s.replace(/<motion\/div/g, '<div');
  if (!s.includes('wcu-card-title:hover')) {
    s = s.replace('<style jsx>{`', `<style jsx>{\`
        :global(.wcu-card-title) { transition: color 0.3s; }
        :global(.group:hover .wcu-card-title) { color: var(--wb-primary); }
`);
  }
  fs.writeFileSync(path.join(root, 'WhyChooseUsSection.tsx'), s);
  console.log('WhyChooseUsSection done');
}

// ServingAreasSection
{
  let s = fs.readFileSync(path.join(root, 'ServingAreasSection.tsx'), 'utf8');
  if (!s.includes("useSectionTheme")) {
    s = s.replace(
      "import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';",
      "import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';\nimport { useSectionTheme } from '@/app/hooks/useSectionTheme';"
    );
  }
  s = stripFontRefs(s);
  // AreaCard gets hook
  s = s.replace(
    'function AreaCard({ area, index }: { area: DisplayArea; index: number }) {',
    'function AreaCard({ area, index }: { area: DisplayArea; index: number }) {\n  const theme = useSectionTheme();\n  const { colors, fonts, styles } = theme;'
  );
  s = addHook(s, 'export function ServingAreasSection({ servingAreasSection, className }: ServingAreasSectionProps) {', hook);
  s = s.replace("style={{ background: '#e8f0ea' }}", 'style={styles.imagePlaceholder}');
  s = s.replace('text-[#7A9A5C]"', '" style={{ color: colors.primaryButton }}');
  s = s.replace('text-[#242A26] mb-1"', '" style={{ fontFamily: fonts.heading, color: colors.mainText }}');
  s = s.replace('text-sm font-medium text-[#7A9A5C] mb-4"', 'text-sm font-medium mb-4" style={{ ...styles.accentText, fontFamily: fonts.body }}');
  s = s.replace('text-sm text-[#242A26]/80 leading-relaxed mt-4"', 'text-sm leading-relaxed mt-4" style={{ color: colors.mainText, opacity: 0.8, fontFamily: fonts.body }}');
  s = s.replace(
    "'bg-[#f8f8f5] rounded-xl p-6 md:p-8 shadow-lg border border-[#e8f0ea] animate-fade-in-up transform hover:scale-105 transition-all duration-300 block text-left w-full'",
    "'rounded-xl p-6 md:p-8 shadow-lg animate-fade-in-up transform hover:scale-105 transition-all duration-300 block text-left w-full'"
  );
  s = s.replace(
    'className={className}\n        style={{ animationDelay:',
    'className={className}\n        style={{ ...styles.cardSolid, animationDelay:'
  );
  s = s.replace(
    'className={cn(`relative py-20 lg:py-32 overflow-hidden`, className)}',
    'className={cn(\'relative py-20 lg:py-32 overflow-hidden\', className)}\n      style={{ fontFamily: fonts.body }}'
  );
  s = s.replace(
    '<div className="absolute inset-0 bg-gradient-to-br from-[#f0f4f1] via-[#f8f8f5] to-[#e8f0ea] animate-gradient-shift" />',
    '<div className="absolute inset-0 animate-gradient-shift" style={styles.sectionGradientBg} />'
  );
  s = s.replace(
    /className="absolute w-2 h-2 bg-\[#7A9A5C\] rounded-full opacity-20 animate-float"/g,
    'className="absolute w(floatingDot) w-2 h-2 rounded-full opacity-20 animate-float" style={styles.floatingDot}'
  );
  s = s.replace('className="absolute(floatingDot)', 'className="absolute');
  s = s.replace(
    /style=\{\{\s*background: 'linear-gradient\(135deg, #242A26 0%, #7A9A5C 100%\)',\s*WebkitBackgroundClip: 'text',\s*WebkitTextFillColor: 'transparent',\s*backgroundClip: 'text',\s*animationDelay: '0s',\s*\}\}/g,
    "style={{ fontFamily: fonts.heading, ...styles.titleGradient, animationDelay: '0s' }}"
  );
  s = s.replace('text-lg md:text-xl text-[#242A26]/70 max-w-3xl', 'text-lg md:text-xl max-w-3xl');
  s = s.replace(
    'className="text-lg md:text-xl max-w-3xl mx-auto animate-fade-in-up"',
    'className="text-lg md:text-xl max-w-3xl mx-auto animate-fade-in-up"\n            style={{ color: colors.secondaryText, fontFamily: fonts.body }}'
  );
  s = s.replace(
    '<div className="bg-[#f8f8f5] rounded-xl p-8 shadow-lg border border-[#e8f0ea] max-w-2xl mx-auto">',
    '<div className="rounded-xl p-8 shadow-lg max-w-2xl mx-auto" style={styles.cardSolid}>'
  );
  s = s.replace('text-xl sm:text-2xl font-semibold mb-4 text-[#242A26]`}', 'text-xl sm:text-2xl font-semibold mb-4`}\n              style={{ fontFamily: fonts.heading, color: colors.mainText }}');
  s = s.replace('className="text-[#242A26]/70 mb-6 max-w-xl mx-auto"', 'className="mb-6 max-w-xl mx-auto" style={{ color: colors.secondaryText, fontFamily: fonts.body }}');
  s = s.replace(
    /className=\{`\s*inline-block px-8 py-4 bg-\[#2A2A2A\] text-white font-medium text-sm tracking-wide uppercase transition-all duration-500 hover:bg-\[#7A9A5C\] hover:shadow-2xl hover:-translate-y-2 hover:scale-105 group relative overflow-hidden`\}/g,
    'className="inline-block px-8 py-4 font-medium text-sm tracking-wide uppercase transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 group relative overflow-hidden"\n              style={{ fontFamily: fonts.body, backgroundColor: colors.mainText, color: \'var(--wb-text-on-dark, #fff)\' }}'
  );
  s = s.replace(
    '<div className="absolute inset-0 bg-gradient-to-r from-[#7A9A5C] to-[#5D6939] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />',
    '<div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" style={{ background: `linear-gradient(to right, ${colors.primaryButton}, ${colors.hoverActive})` }} />'
  );
  fs.writeFileSync(path.join(root, 'ServingAreasSection.tsx'), s);
  console.log('ServingAreasSection done');
}

console.log('batch complete');
