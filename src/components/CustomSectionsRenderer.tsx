import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { CmsMediaRenderer } from './CmsMedia';

export const CustomSectionsRenderer: React.FC = () => {
  const { cms } = useSiteContent();

  const visibleSections = [...cms.customSections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  if (visibleSections.length === 0) return null;

  return (
    <>
      {visibleSections.map((sec) => {
        const isDark = sec.theme === 'dark';

        if (sec.layout === 'centered-banner') {
          return (
            <section
              key={sec.id}
              id={`custom-section-${sec.id}`}
              className={`py-16 md:py-24 border-b transition-colors ${
                isDark
                  ? 'bg-[#141414] text-[#FAF8F5] border-[#292520]'
                  : 'bg-[#F5EFEB]/60 text-[#141414] border-[#E8E2D9]'
              }`}
            >
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                {sec.kicker && (
                  <div
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold"
                    style={{ color: isDark ? '#D4AF37' : 'var(--cms-accent, #785E19)' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{sec.kicker}</span>
                  </div>
                )}

                <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
                  {sec.title}
                </h2>

                {sec.description && (
                  <p
                    className={`text-sm md:text-base max-w-2xl mx-auto leading-relaxed ${
                      isDark ? 'text-[#C2B9AD]' : 'text-[#554E47]'
                    }`}
                  >
                    {sec.description}
                  </p>
                )}

                {sec.mediaUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-xl max-w-4xl mx-auto aspect-video bg-[#141414]">
                    <CmsMediaRenderer
                      src={sec.mediaUrl}
                      mediaType={sec.mediaType}
                      alt={sec.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {sec.body && (
                  <p
                    className={`text-sm max-w-2xl mx-auto leading-relaxed ${
                      isDark ? 'text-[#B0A79E]' : 'text-[#4E4741]'
                    }`}
                  >
                    {sec.body}
                  </p>
                )}

                {sec.ctaLabel && (
                  <div className="pt-2">
                    <a
                      href={sec.ctaHref || '#collection-grid'}
                      className={`inline-flex items-center gap-2 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                        isDark
                          ? 'bg-[#FAF8F5] text-[#141414] hover:bg-[#D4AF37]'
                          : 'bg-[#141414] text-[#FAF8F5] hover:bg-[#785E19]'
                      }`}
                    >
                      <span>{sec.ctaLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </section>
          );
        }

        const isMediaLeft = sec.layout === 'split-left';

        return (
          <section
            key={sec.id}
            id={`custom-section-${sec.id}`}
            className={`py-16 md:py-24 border-b transition-colors ${
              isDark
                ? 'bg-[#141414] text-[#FAF8F5] border-[#292520]'
                : 'bg-[#FAF8F5] text-[#141414] border-[#E8E2D9]'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                {/* Media Column */}
                <div
                  className={`lg:col-span-6 ${isMediaLeft ? 'lg:order-1' : 'lg:order-2'}`}
                >
                  {sec.mediaUrl ? (
                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-[#D4AF37]/30 aspect-[16/10] sm:aspect-[4/3] bg-[#141414]">
                      <CmsMediaRenderer
                        src={sec.mediaUrl}
                        mediaType={sec.mediaType}
                        alt={sec.title}
                        className="w-full h-full object-cover"
                      />
                      {sec.badgeText && (
                        <div className="absolute top-4 left-4 bg-[#141414]/85 text-[#E6CA85] text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-xs border border-[#3E3830]">
                          {sec.badgeText}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Narrative Column */}
                <div
                  className={`lg:col-span-6 space-y-5 ${
                    isMediaLeft ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  {sec.kicker && (
                    <div
                      className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold"
                      style={{ color: isDark ? '#D4AF37' : 'var(--cms-accent, #785E19)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{sec.kicker}</span>
                    </div>
                  )}

                  <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.12]">
                    {sec.title}
                  </h2>

                  {sec.description && (
                    <p
                      className={`text-base md:text-lg font-serif italic ${
                        isDark ? 'text-[#E8DCC4]' : 'text-[#4E4741]'
                      }`}
                    >
                      {sec.description}
                    </p>
                  )}

                  {sec.body && (
                    <p
                      className={`text-sm md:text-base leading-relaxed whitespace-pre-line ${
                        isDark ? 'text-[#C2B9AD]' : 'text-[#554E47]'
                      }`}
                    >
                      {sec.body}
                    </p>
                  )}

                  {sec.ctaLabel && (
                    <div className="pt-2">
                      <a
                        href={sec.ctaHref || '#collection-grid'}
                        className={`inline-flex items-center gap-2 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                          isDark
                            ? 'bg-[#FAF8F5] text-[#141414] hover:bg-[#D4AF37]'
                            : 'bg-[#141414] text-[#FAF8F5] hover:bg-[#785E19]'
                        }`}
                      >
                        <span>{sec.ctaLabel}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
};
